"use server"

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products"
import { db } from "@/db"
import { Order } from "@/generated/prisma"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export const createCheckoutSession = async ({ configId }: { configId: string }) => {
    try {
        const configuration = await db.configuration.findUnique({
            where: { id: configId },
        })

        if (!configuration) {
            throw new Error("No such configuration found")
        }

        const { getUser } = getKindeServerSession();
        const user = await getUser()

        if (!user) {
            throw new Error('You need to be logged in');
        }

        const { finish, material } = configuration;

        let price = BASE_PRICE;
        if (material === "polycarbonate") price += PRODUCT_PRICES.material.polycarbonate
        if (finish === "textured") price += PRODUCT_PRICES.finish.textured


        let order: Order | undefined = undefined

        const existingOrder = await db.order.findFirst({
            where: {
                userId: user.id,
                configurationId: configuration.id,
            },
        })

        if (existingOrder) {
            order = existingOrder;
        } else {
            order = await db.order.create({
                data: {
                    amount: price,
                    userId: user.id,
                    configurationId: configuration.id,
                    isPaid: true,
                    status: "fulfilled",
                }
            })
        }
        if (order) {
            return { url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}` }
        } else {
            return { url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}` }
        }
    } catch (error: any) {
        throw new Error(error.message)
    }

}