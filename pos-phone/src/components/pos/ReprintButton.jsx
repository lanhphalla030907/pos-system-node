import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from './Receipt';

const ReprintButton = ({ order }) => {
  const receiptRef = useRef();

  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
  });

  return (
    <>
      <button
        onClick={printReceipt}
        className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-950"
      >
        Reprint Receipt
      </button>
      
      
      <div className="hidden">
        <Receipt ref={receiptRef} order={order} />
      </div>
    </>
  );
};

export default ReprintButton;