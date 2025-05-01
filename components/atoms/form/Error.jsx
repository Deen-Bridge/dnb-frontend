import React from 'react'

const Error = ({errMsg}) => {
  return (
      <p className="text-sm text-red-600">{errMsg}</p>
  )
}

export default Error;
