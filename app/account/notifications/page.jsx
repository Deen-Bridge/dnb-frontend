"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function NotificationsPage() {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Your recent platform notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="hidden sm:table-cell">Message</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Badge className="text-xs" variant="secondary">
                  Message
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                You have a new message from Ustadh Ahmad.
              </TableCell>
              <TableCell className="hidden md:table-cell">2025-06-24</TableCell>
              <TableCell className="text-right">
                <Badge className="text-xs" variant="secondary">
                  Unread
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="text-xs" variant="accent">
                  Course
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                Your enrollment in "Quranic Arabic 101" was successful.
              </TableCell>
              <TableCell className="hidden md:table-cell">2025-06-23</TableCell>
              <TableCell className="text-right">
                <Badge className="text-xs" variant="secondary">
                  Read
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="text-xs" variant="outline">
                  Book
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                "The Seerah of the Prophet" is now available for download.
              </TableCell>
              <TableCell className="hidden md:table-cell">2025-06-22</TableCell>
              <TableCell className="text-right">
                <Badge className="text-xs" variant="secondary">
                  Read
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="text-xs" variant="secondary">
                  Space
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                Your request to join "Sisters' Study Circle" was approved.
              </TableCell>
              <TableCell className="hidden md:table-cell">2025-06-20</TableCell>
              <TableCell className="text-right">
                <Badge className="text-xs" variant="secondary">
                  Read
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="text-xs" variant="destructive">
                  Alert
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                Your password was changed successfully.
              </TableCell>
              <TableCell className="hidden md:table-cell">2025-06-18</TableCell>
              <TableCell className="text-right">
                <Badge className="text-xs" variant="secondary">
                  Read
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}