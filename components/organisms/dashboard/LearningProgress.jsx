"use client"

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

export default function LearningProgress() {
    return (
        <Card>
            <CardHeader className="pt-4">
                <CardTitle className={"text-lg font-semibold"}>Study Progress</CardTitle>
                <CardDescription>Monthly study activity</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                    <BarChart3 className="h-10 w-10" />
                    <p className="text-sm text-center">No activity yet</p>
                    <p className="max-w-xs text-center text-xs">
                        Your course and reading activity will appear here once you get started.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Tracking your memorization and study over time
                </div>
            </CardFooter>
        </Card>
    )
}
