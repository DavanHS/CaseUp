"use server";

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getAuthStatus = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  console.log("Kinde user:", user);
  console.log("User ID:", user?.id);
  console.log("User email:", user?.email);

  if (!user?.id || !user.email) {
    throw new Error("Invalid user data");
  }

  const existingUser = await db.user.findFirst({
    where: { id: user.id },
  });

  console.log("Existing user:", existingUser); // 🔥 Add this

  if (!existingUser) {
    console.log("Creating new user..."); // 🔥 Add this
    
    const newUser = await db.user.create({
      data: {
        id: user.id,
        email: user.email,
      },
    });
    
    console.log("Created user:", newUser); // 🔥 Add this
  }

  return { success: true };
};