"use client"

import dynamic from "next/dynamic"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Inter_500 } from "@/lib/config/font.config";

const LearningProgressChart = dynamic(
    () => import("@/components/organisms/dashboard/LearningProgressChart"),
    {
        ssr: false,
        loading: () => (
            <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
        ),
    }
)

export default function LearningProgress() {
    return (
        <Card>
            <CardHeader className="pt-4">
                <CardTitle className={"text-lg font-semibold"}>Study Progress</CardTitle>
                <CardDescription>Monthly activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                    <BarChart3 className="h-10 w-10" />
                    <p className="text-sm text-center">Monthly activity data coming soon</p>
                </div>
                <LearningProgressChart />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Tracking your memorization and study over time
                </div>
            </CardFooter>
        </Card>
    )
}
