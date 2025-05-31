"use client"
import React from 'react'
import { Eye, Star, BarChart3, DownloadCloud } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAverageRating } from "@/hooks/getAverageRating";
import Link from 'next/link';
const BookStatsInfo = ({ book }) => {
  const averageRating = getAverageRating(book?.reviews);

  return (
    <div>
      {/* Author Card */}
      {book && (
        <div className="space-y-8 w-full">
          <div className="bg-accent p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition">
            <span className="text-xl font-bold flex items-center pb-2 gap-2 text-white">Author</span>
            <Link href={`/account/profile/${book.author?._id}`} className="flex items-center gap-4 mb-4">
              <Avatar className="h-14 w-14 border border-white/10 shadow-lg">
                <AvatarImage src={book.author?.avatar} />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              <div className="text-white ">
                <p className="font-bold ">{book.author?.name}</p>
                <p className="text-sm text-white ">{book.author?.role}</p>
              </div>
            </Link>
            <p className="text-sm  text-white ">{book.author?.bio || "No Bio for now"}</p>
          </div>


          {/* Book Stats */}
          <div className="bg-accent p-6 rounded-3xl text-white  backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 pb-2">
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
              value={
                averageRating > 0
                  ? `${averageRating.toFixed(1)} / 5.0`
                  : "No Rating Yet"
              }
            />
          </div>



          <div className="bg-accent p-6 rounded-3xl backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition">
            <span className="text-xl font-bold flex items-center pb-2 gap-2 text-white">Reviews</span>
            {book.reviews && book.reviews.length > 0 ? (
              book.reviews.slice(0, 3).map((review) => (
                <div key={review._id} className="border-b border-white/10 pb-4 mb-4">
                  <Link href={`/account/profile/${review.user._id}`} className="flex items-center gap-3 mb-2">

                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>UR</AvatarFallback>
                    </Avatar>

                    <div className="text-white">
                      <p className="font-semibold">{review.user.name}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>

                  </Link>
                  <p className="text-white text-sm">{review.comment}</p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        size={14}
                        fill={index < review.rating ? "#FFD700" : "none"}
                        stroke="#FFD700"
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white">No reviews yet. Be the first to review!</p>
            )}
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
