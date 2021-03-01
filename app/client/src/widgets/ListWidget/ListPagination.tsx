import React from "react";
import Pagination from "rc-pagination";

interface ListPaginationProps {
  total: number;
}

const ListPagination: React.FC<ListPaginationProps> = () => {
  return (
    <div>
      <Pagination pageSize={1} />
    </div>
  );
};

export default ListPagination;
