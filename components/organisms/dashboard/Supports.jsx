import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import Button from '@/components/atoms/form/Button'
const SupportPalestine = () => {
    return (
        <div className="mx-auto  text-black w-full">
            <Card x-chunk="dashboard-02-chunk-0">
                <CardHeader className="mt-4 p-2 md:p-4">
                    <CardTitle className="text-3xl font-bold">Support Palestine</CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                    The Palestinian people face displacement and lack essential services. Your donations can provide vital aid and support.

                </CardContent>
                <CardFooter>
                    <Button round wide className="w-full text-sm bg-accent text-white">
                        Donate
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default SupportPalestine;
