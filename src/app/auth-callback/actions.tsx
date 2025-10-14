"use server";

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getAuthStatus = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id || !user.email) {
    throw new Error("Invalid user data");
  }

  console.log('Kinde User ID:', user.id);
  console.log('Kinde User Email:', user.email);

  try {
    // Try to find user by Kinde ID first
    let dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (dbUser) {
      console.log('Found user by Kinde ID:', dbUser.id);
    }

    // If not found, try to find by email
    if (!dbUser) {
      dbUser = await db.user.findFirst({
        where: {
          email: user.email,
        },
      });

      if (dbUser) {
        console.log('Found user by email. DB ID:', dbUser.id);
        console.log('Updating DB user ID from', dbUser.id, 'to Kinde ID:', user.id);
        
        // Update existing user with Kinde ID
        await db.user.update({
          where: { id: dbUser.id },
          data: { id: user.id },
        });
      } else {
        console.log('Creating new user with Kinde ID:', user.id);
        // Create new user if not found
        await db.user.create({
          data: {
            id: user.id,
            email: user.email,
          },
        });
      }
    }

    // Get final user state
    const finalUser = await db.user.findUnique({
      where: { id: user.id },
    });
    console.log('Final user state:', {
      dbId: finalUser?.id,
      email: finalUser?.email,
      kindeId: user.id
    });

    return { success: true };
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Failed to sync user data");
  }
};
