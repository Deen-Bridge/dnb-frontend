"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

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

export default function LearningProgressChart() {
    return (
        <ChartContainer config={chartConfig} className="hidden">
            <BarChart accessibilityLayer data={[]}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="course" fill="var(--color-course)" radius={4} />
                <Bar dataKey="book" fill="var(--color-book)" radius={4} />
            </BarChart>
        </ChartContainer>
    )
}
