"use client";
import React from 'react';
import StarRatings from 'react-star-ratings';

/**
 * StarRate - a reusable star rating component
 * @param {number} value - current rating value
 * @param {function} onChange - callback when rating changes
 * @param {number} maxStars - number of stars (default 5)
 * @param {boolean} editable - if true, user can change rating
 * @param {string} label - optional label to show below
 */
const StarRate = ({ value = 0, onChange, maxStars = 5, editable = true, label }) => {
  const handleChange = (newRating) => {
    if (editable && onChange) onChange(newRating);
  };

  return (
    <div>
      <StarRatings
        rating={value}
        starRatedColor="#265902"
        starEmptyColor="lightgray"
        starHoverColor="#008200"
        changeRating={handleChange}
        numberOfStars={maxStars}
        name="rating"
        starDimension="30px"
        starSpacing="5px"
        isSelectable={editable}
      />
      {label && <p>{label}</p>}
    </div>
  );
};

export default StarRate;
