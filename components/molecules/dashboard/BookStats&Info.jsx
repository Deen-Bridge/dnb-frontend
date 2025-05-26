"use client"
import React from 'react'
import { Eye, Star, BarChart3, DownloadCloud } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BookStatsInfo = ({book}) => {
  return (
    <div>
         {/* Author Card */}
        {book && (
          <div className="space-y-8">
            <div className="bg-accent p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition">
            <span className="text-3xl font-bold flex items-center p-2 gap-2 text-white">Author</span>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14 border border-white/10 shadow-lg">
                  <AvatarImage src={book.author?.avatar} />
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <div className="text-white ">
                  <p className="font-bold ">{book.author?.name}</p>
                     <p className="text-sm text-white ">{book.author?.role}</p>
                </div>
              </div>
                 <p className="text-sm  text-white ">{book.author?.bio || "No Bio for now"}</p>
            </div>
            {/* Book Stats */}
            <div className="bg-accent p-6 rounded-3xl text-white  backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 ">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
                Book Stats
              </h3>
              <StatRow icon={<Eye className="w-4 h-4 text-cyan-400" />} label="Monthly Reads" value={book.monthlyReads} />
              <StatRow
                icon={<DownloadCloud className="w-4 h-4 text-green-400" />}
                label="Downloads"
                value={book.downloads || 0}
              />
              <StatRow
                icon={<Star className="w-4 h-4 text-yellow-400" />}
                label="Rating"
                value={`${book.rating} / 5` || "No Rating Yet" }
              />
            </div>
          </div>
        )}
    </div>
  )
}
function StatRow({ icon, label, value }) {
    return (
        <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">{icon} {label}</div>
            <span className="font-bold">{value}</span>
        </div>
    );
}

export default BookStatsInfo
