import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Button from '@/components/atoms/form/Button'
const AccountMain = () => {
    return (
        <div className="mt-auto p-4 text-black">
            <Card x-chunk="dashboard-02-chunk-0">
                <CardHeader className="p-2 pt-0 md:p-4">
                    <CardTitle>Support Palestine</CardTitle>
                    <CardDescription>
                    The Palestinian people face displacement and lack essential services. Your donations can provide vital aid and support.                    </CardDescription>
                </CardHeader>
                <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                    <Button round wide className="w-full text-sm bg-accent text-white">
                        Donate
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default AccountMain;
