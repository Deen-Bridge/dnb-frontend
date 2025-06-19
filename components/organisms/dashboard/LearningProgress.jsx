"use client"

import { TrendingUp } from "lucide-react"
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
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils";
import { roboto_500 } from "@/lib/config/font.config";
const chartData = [
    { month: "January", course: 186, book: 80 },
    { month: "February", course: 305, book: 200 },
    { month: "March", course: 237, book: 120 },
    { month: "April", course: 73, book: 190 },
    { month: "May", course: 209, book: 130 },
    { month: "June", course: 214, book: 140 },
]

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
                <CardTitle className={cn(roboto_500.className)}>Study Progress</CardTitle>
                <CardDescription> Activities completed (January – June)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} >
                    <BarChart accessibilityLayer data={chartData} >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            
                        />
                        <ChartTooltip
                            cursor={false}
                            className="bg-accent text-white" 
                            content={<ChartTooltipContent indicator="dashed"/>}
                        />
                        <Bar dataKey="course" fill="var(--color-accent)" radius={4} />
                        <Bar dataKey="book" fill="var(--color-accent)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    You've boosted study by 30%
                <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Tracking your memorization and study over the last 6 months
                    </div>
            </CardFooter>
        </Card>
    )
}
