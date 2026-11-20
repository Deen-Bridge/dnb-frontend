"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import {
  ShieldCheck,
  Activity,
  Footprints,
  HeartPulse,
  Route,
  Flame,
  Moon,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  poppins_400,
  poppins_500,
  poppins_600,
} from "@/lib/config/font.config"

export const description = "A collection of health charts."

/* ── design-system building blocks ── */

const Panel = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl border border-accent/10 bg-surface-raised shadow-sm",
      className
    )}
  >
    {children}
  </div>
)

const IconChip = ({ icon: Icon }) => (
  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-accent/5 bg-gradient-to-br from-secondary/15 to-highlight/10">
    <Icon className="h-5 w-5 text-accent" />
  </div>
)

const SectionHeading = ({ icon, title, subtitle, right }) => (
  <div className="mb-5 flex items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      {icon && <IconChip icon={icon} />}
      <div>
        <h2 className={cn(poppins_600, "text-base text-ink")}>{title}</h2>
        {subtitle && (
          <p className={cn(poppins_400, "mt-0.5 text-sm text-ink-muted")}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {right}
  </div>
)

const StatValue = ({ value, unit }) => (
  <p
    className={cn(
      poppins_600,
      "flex items-baseline gap-1 text-3xl tabular-nums leading-none text-ink"
    )}
  >
    {value}
    {unit && (
      <span className={cn(poppins_400, "text-sm text-ink-muted")}>{unit}</span>
    )}
  </p>
)

export default function SecurityPage() {
  return (
    <div className="min-h-full bg-surface p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-accent/5 bg-gradient-to-br from-secondary/20 to-highlight/10">
            <ShieldCheck className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1
              className={cn(
                poppins_600,
                "bg-gradient-to-r from-secondary via-highlight to-accent bg-clip-text text-2xl text-transparent"
              )}
            >
              Activity Overview
            </h1>
            <p className={cn(poppins_400, "text-sm text-ink-muted")}>
              A snapshot of your recent activity and wellbeing metrics
            </p>
          </div>
        </div>

        {/* ── Steps (2/3) · Heart rate (1/3) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="p-6 lg:col-span-2">
            <SectionHeading
              icon={Footprints}
              title="Daily Steps"
              subtitle="Steps recorded over the past 7 days"
              right={
                <div className="text-right">
                  <StatValue value="12,584" unit="steps" />
                  <p
                    className={cn(
                      poppins_400,
                      "mt-1 text-xs uppercase tracking-wider text-ink-muted"
                    )}
                  >
                    Today
                  </p>
                </div>
              }
            />
            <ChartContainer
              config={{
                steps: {
                  label: "Steps",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-56 w-full"
            >
              <BarChart
                accessibilityLayer
                margin={{
                  left: -4,
                  right: -4,
                }}
                data={[
                  { date: "2024-01-01", steps: 2000 },
                  { date: "2024-01-02", steps: 2100 },
                  { date: "2024-01-03", steps: 2200 },
                  { date: "2024-01-04", steps: 1300 },
                  { date: "2024-01-05", steps: 1400 },
                  { date: "2024-01-06", steps: 2500 },
                  { date: "2024-01-07", steps: 1600 },
                ]}
              >
                <Bar
                  dataKey="steps"
                  fill="var(--color-accent)"
                  radius={5}
                  fillOpacity={0.6}
                  activeBar={<Rectangle fillOpacity={0.8} />}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                />
                <ChartTooltip
                  defaultIndex={2}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                />
                <ReferenceLine
                  y={1200}
                  stroke="var(--color-accent)"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                >
                  <Label
                    position="insideBottomLeft"
                    value="Average Steps"
                    offset={10}
                    fill="var(--color-accent)"
                  />
                  <Label
                    position="insideTopLeft"
                    value="12,343"
                    className="text-lg"
                    fill="var(--color-accent))"
                    offset={10}
                    startOffset={100}
                  />
                </ReferenceLine>
              </BarChart>
            </ChartContainer>
            <div className="mt-5 space-y-1 border-t border-accent/10 pt-4">
              <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                Over the past 7 days, you have walked{" "}
                <span className={cn(poppins_500, "text-ink")}>53,305</span>{" "}
                steps.
              </p>
              <p className={cn(poppins_400, "text-sm text-ink-muted")}>
                You need{" "}
                <span className={cn(poppins_500, "text-ink")}>12,584</span> more
                steps to reach your goal.
              </p>
            </div>
          </Panel>

          <Panel className="flex flex-col p-6">
            <SectionHeading
              icon={HeartPulse}
              title="Heart Rate"
              subtitle="Resting rate and variability"
            />
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-accent/10 bg-surface px-3 py-2.5">
                <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                  Resting HR
                </p>
                <StatValue value="62" unit="bpm" />
              </div>
              <div className="rounded-xl border border-accent/10 bg-surface px-3 py-2.5">
                <p className={cn(poppins_400, "text-xs text-ink-muted")}>
                  Variability
                </p>
                <StatValue value="35" unit="ms" />
              </div>
            </div>
            <ChartContainer
              config={{
                resting: {
                  label: "Resting",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="mt-auto w-full"
            >
              <LineChart
                accessibilityLayer
                margin={{
                  left: 14,
                  right: 14,
                  top: 10,
                }}
                data={[
                  { date: "2024-01-01", resting: 62 },
                  { date: "2024-01-02", resting: 72 },
                  { date: "2024-01-03", resting: 35 },
                  { date: "2024-01-04", resting: 62 },
                  { date: "2024-01-05", resting: 52 },
                  { date: "2024-01-06", resting: 62 },
                  { date: "2024-01-07", resting: 70 },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--color-accent)"
                  strokeOpacity={0.12}
                />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                    })
                  }}
                />
                <Line
                  dataKey="resting"
                  type="natural"
                  fill="var(--color-resting)"
                  stroke="var(--color-resting)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    fill: "var(--color-resting)",
                    stroke: "var(--color-resting)",
                    r: 4,
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                    />
                  }
                  cursor={false}
                />
              </LineChart>
            </ChartContainer>
          </Panel>
        </div>

        {/* ── Progress · Activity rings · Move breakdown ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="p-6">
            <SectionHeading
              icon={Target}
              title="Yearly Progress"
              subtitle="More steps a day this year than last"
            />
            <div className="grid gap-5">
              <div className="grid auto-rows-min gap-2">
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none text-ink">
                  12,453
                  <span className="text-sm font-normal text-ink-muted">
                    steps/day
                  </span>
                </div>
                <ChartContainer
                  config={{
                    steps: {
                      label: "Steps",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="aspect-auto h-[32px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    layout="vertical"
                    margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                    data={[{ date: "2024", steps: 12435 }]}
                  >
                    <Bar
                      dataKey="steps"
                      fill="var(--color-accent)"
                      radius={4}
                      barSize={32}
                    >
                      <LabelList
                        position="insideLeft"
                        dataKey="date"
                        offset={8}
                        fontSize={12}
                        fill="white"
                      />
                    </Bar>
                    <YAxis dataKey="date" type="category" tickCount={1} hide />
                    <XAxis dataKey="steps" type="number" hide />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="grid auto-rows-min gap-2">
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none text-ink">
                  10,103
                  <span className="text-sm font-normal text-ink-muted">
                    steps/day
                  </span>
                </div>
                <ChartContainer
                  config={{
                    steps: {
                      label: "Steps",
                      color: "hsl(var(--muted))",
                    },
                  }}
                  className="aspect-auto h-[32px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    layout="vertical"
                    margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                    data={[{ date: "2023", steps: 10103 }]}
                  >
                    <Bar
                      dataKey="steps"
                      fill="var(--color-accent)"
                      radius={4}
                      barSize={32}
                      fillOpacity={0.4}
                    >
                      <LabelList
                        position="insideLeft"
                        dataKey="date"
                        offset={8}
                        fontSize={12}
                        fill="white"
                      />
                    </Bar>
                    <YAxis dataKey="date" type="category" tickCount={1} hide />
                    <XAxis dataKey="steps" type="number" hide />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </Panel>

          <Panel className="flex flex-col p-6">
            <SectionHeading
              icon={Activity}
              title="Activity Rings"
              subtitle="Move, exercise and stand goals"
            />
            <ChartContainer
              config={{
                move: { label: "Move", color: "hsl(var(--chart-1))" },
                exercise: { label: "Exercise", color: "hsl(var(--chart-2))" },
                stand: { label: "Stand", color: "hsl(var(--chart-3))" },
              }}
              className="mx-auto my-auto aspect-square w-full max-w-[80%]"
            >
              <RadialBarChart
                margin={{ left: -10, right: -10, top: -10, bottom: -10 }}
                data={[
                  {
                    activity: "stand",
                    value: (8 / 12) * 100,
                    fill: "var(--color-accent)",
                  },
                  {
                    activity: "exercise",
                    value: (46 / 60) * 100,
                    fill: "var(--color-accent)",
                  },
                  {
                    activity: "move",
                    value: (245 / 360) * 100,
                    fill: "var(--color-accent)",
                  },
                ]}
                innerRadius="20%"
                barSize={24}
                startAngle={90}
                endAngle={450}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  dataKey="value"
                  tick={false}
                />
                <RadialBar dataKey="value" background cornerRadius={5} />
              </RadialBarChart>
            </ChartContainer>
          </Panel>

          <Panel className="flex flex-col p-6">
            <SectionHeading
              icon={Flame}
              title="Move · Exercise · Stand"
              subtitle="Today's progress toward your rings"
            />
            <ChartContainer
              config={{
                move: { label: "Move", color: "hsl(var(--chart-1))" },
                stand: { label: "Stand", color: "hsl(var(--chart-2))" },
                exercise: { label: "Exercise", color: "hsl(var(--chart-3))" },
              }}
              className="h-[140px] w-full"
            >
              <BarChart
                margin={{ left: 0, right: 0, top: 0, bottom: 10 }}
                data={[
                  {
                    activity: "stand",
                    value: (8 / 12) * 100,
                    label: "8/12 hr",
                    fill: "var(--color-accent)",
                  },
                  {
                    activity: "exercise",
                    value: (46 / 60) * 100,
                    label: "46/60 min",
                    fill: "var(--color-accent)",
                  },
                  {
                    activity: "move",
                    value: (245 / 360) * 100,
                    label: "245/360 kcal",
                    fill: "var(--color-accent)",
                  },
                ]}
                layout="vertical"
                barSize={32}
                barGap={2}
              >
                <XAxis type="number" dataKey="value" hide />
                <YAxis
                  dataKey="activity"
                  type="category"
                  tickLine={false}
                  tickMargin={4}
                  axisLine={false}
                  className="capitalize"
                />
                <Bar dataKey="value" radius={5}>
                  <LabelList
                    position="insideLeft"
                    dataKey="label"
                    fill="white"
                    offset={8}
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="mt-auto flex w-full items-center gap-2 border-t border-accent/10 pt-4">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className={cn(poppins_400, "text-xs text-ink-muted")}>
                  Move
                </div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-ink">
                  562
                  <span className="text-xs font-normal text-ink-muted">
                    kcal
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="mx-1 h-9 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className={cn(poppins_400, "text-xs text-ink-muted")}>
                  Exercise
                </div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-ink">
                  73
                  <span className="text-xs font-normal text-ink-muted">
                    min
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="mx-1 h-9 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className={cn(poppins_400, "text-xs text-ink-muted")}>
                  Stand
                </div>
                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-ink">
                  14
                  <span className="text-xs font-normal text-ink-muted">hr</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Walking distance · Active energy · Time in bed ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="p-6">
            <SectionHeading
              icon={Route}
              title="Walking Distance"
              subtitle="12.5 miles per day over the last 7 days"
            />
            <div className="flex flex-row items-baseline gap-4">
              <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none text-ink">
                12.5
                <span className="text-sm font-normal text-ink-muted">
                  miles/day
                </span>
              </div>
              <ChartContainer
                config={{
                  steps: {
                    label: "Steps",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="ml-auto w-[72px]"
              >
                <BarChart
                  accessibilityLayer
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  data={[
                    { date: "2024-01-01", steps: 2000 },
                    { date: "2024-01-02", steps: 2100 },
                    { date: "2024-01-03", steps: 2200 },
                    { date: "2024-01-04", steps: 1300 },
                    { date: "2024-01-05", steps: 1400 },
                    { date: "2024-01-06", steps: 2500 },
                    { date: "2024-01-07", steps: 1600 },
                  ]}
                >
                  <Bar
                    dataKey="steps"
                    fill="var(--color-accent)"
                    radius={2}
                    fillOpacity={0.2}
                    activeIndex={6}
                    activeBar={<Rectangle fillOpacity={0.8} />}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    hide
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading
              icon={Flame}
              title="Active Energy"
              subtitle="Averaging 754 calories per day"
            />
            <div className="flex flex-row items-baseline gap-4">
              <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none text-ink">
                1,254
                <span className="text-sm font-normal text-ink-muted">
                  kcal/day
                </span>
              </div>
              <ChartContainer
                config={{
                  calories: {
                    label: "Calories",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="ml-auto w-[64px]"
              >
                <BarChart
                  accessibilityLayer
                  margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  data={[
                    { date: "2024-01-01", calories: 354 },
                    { date: "2024-01-02", calories: 514 },
                    { date: "2024-01-03", calories: 345 },
                    { date: "2024-01-04", calories: 734 },
                    { date: "2024-01-05", calories: 645 },
                    { date: "2024-01-06", calories: 456 },
                    { date: "2024-01-07", calories: 345 },
                  ]}
                >
                  <Bar
                    dataKey="calories"
                    fill="var(--color-accent)"
                    radius={2}
                    fillOpacity={0.2}
                    activeIndex={6}
                    activeBar={<Rectangle fillOpacity={0.8} />}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    hide
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHeading
              icon={Moon}
              title="Time in Bed"
              subtitle="Sleep duration this week"
              right={
                <div className="flex items-baseline gap-1 text-2xl tabular-nums text-ink">
                  <span className={cn(poppins_600)}>8</span>
                  <span
                    className={cn(poppins_400, "text-sm text-ink-muted")}
                  >
                    hr
                  </span>
                  <span className={cn(poppins_600)}>35</span>
                  <span
                    className={cn(poppins_400, "text-sm text-ink-muted")}
                  >
                    min
                  </span>
                </div>
              }
            />
            <ChartContainer
              config={{
                time: {
                  label: "Time",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-32 w-full"
            >
              <AreaChart
                accessibilityLayer
                data={[
                  { date: "2024-01-01", time: 8.5 },
                  { date: "2024-01-02", time: 7.2 },
                  { date: "2024-01-03", time: 8.1 },
                  { date: "2024-01-04", time: 6.2 },
                  { date: "2024-01-05", time: 5.2 },
                  { date: "2024-01-06", time: 8.1 },
                  { date: "2024-01-07", time: 7.0 },
                ]}
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
              >
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 5", "dataMax + 2"]} hide />
                <defs>
                  <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-accent)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="time"
                  type="natural"
                  fill="url(#fillTime)"
                  fillOpacity={0.4}
                  stroke="var(--color-accent)"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  formatter={(value) => (
                    <div className="flex min-w-[120px] items-center text-xs text-ink-muted">
                      Time in bed
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-ink">
                        {value}
                        <span className="font-normal text-ink-muted">hr</span>
                      </div>
                    </div>
                  )}
                />
              </AreaChart>
            </ChartContainer>
          </Panel>
        </div>
      </div>
    </div>
  )
}
