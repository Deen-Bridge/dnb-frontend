import React from 'react'
const Page = ({params}) => {
    const {messageId} = params;
  return (
    <div>
      Message from { messageId}
    </div>
  )
}

export default Page
