import React from 'react'

const HomeGrid = ({ data = [] }) => {
  return (
    <div>
      {data?.map((item, index) => {
        return (
          <div key={index}>
            <div className='text-black text-3xl'>{item.title}</div>
            <div className='text-black'>{item.obj.total}</div>
          </div>
        );
      })}
    </div>
  );
};

export default HomeGrid;