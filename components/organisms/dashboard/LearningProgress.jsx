"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart3 } from "lucide-react";

const chartConfig = {
    course: {
        label: "course",
        color: "hsl(var(--chart-1))",
    },
    book: {
        label: "book",
        color: "hsl(var(--chart-2))",
    },
}

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
                <ChartContainer config={chartConfig} className="hidden">
                    <BarChart accessibilityLayer data={[]}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                        <Bar dataKey="course" fill="var(--color-course)" radius={4} />
                        <Bar dataKey="book" fill="var(--color-book)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="leading-none text-muted-foreground">
                    Tracking your memorization and study over time
                </div>
            </CardFooter>
        </Card>
    )
}
