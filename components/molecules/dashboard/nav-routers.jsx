import React from 'react'
import Button from '@/components/atoms/form/Button';

const links = [{
  name: "Classes",
  link: "/dashboard/classes"
}, {
  name: "LIbrary",
  link: "/dashboard/library"
},
{
  name: "Fiqh",
  link: "/dashboard/fiqh"
}]

const Navrouter = () => {
  return (
    <>
      {links.map((link, index) => (
        <Button outlined wide round   key={index} to={link.link}
          className="px-10">{link.name}</Button>
      ))}
    </>
  );
};

export default Navrouter;
