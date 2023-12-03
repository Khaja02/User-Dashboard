import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import './App.css'; // Import your Tailwind CSS here

const App = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editableRowId, setEditableRowId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageReactPaginate, setCurrentPageReactPaginate] = useState(0); // New state for react-paginate
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
    setCurrentPageReactPaginate(data.selected);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setCurrentPageReactPaginate(pageNumber - 1);
  };

  const handleRowSelect = (rowId) => {
    if (selectedRows.includes(rowId)) {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    } else {
      setSelectedRows([...selectedRows, rowId]);
    }
  };

  const handleDelete = (rowId) => {
    const updatedData = data.filter((row) => row.id !== rowId);
    setData(updatedData);
    setSelectedRows(selectedRows.filter((id) => id !== rowId));
  };

  const handleDeleteSelected = () => {
    const updatedData = data.filter((row) => !selectedRows.includes(row.id));
    setData(updatedData);
    setSelectedRows([]);
  };

  const handleEdit = (rowId) => {
    setEditableRowId(rowId);
    // Initialize edited values with current row values
    const rowToEdit = data.find((row) => row.id === rowId);
    setEditedValues(rowToEdit);
  };

  const handleSave = () => {
    // Update the data with the edited values
    const updatedData = data.map((row) =>
      row.id === editableRowId ? { ...row, name: editedValues.name } : row
    );

    setData(updatedData);
    setEditableRowId(null);
    setEditedValues({});
  };

  const handleInputChange = (e, field) => {
    // Update the edited values when input changes
    setEditedValues({
      ...editedValues,
      [field]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto mt-8">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      <table className="table-auto w-full border shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Action</th>
            <th className="px-4 py-2">
              <button
                className="text-blue-500 bg-gray-200 px-2 py-1 rounded-full"
                onClick={() => setSelectedRows(filteredData.map((row) => row.id))}
              >
                Select All
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row) => (
            <tr key={row.id} className={selectedRows.includes(row.id) ? 'bg-gray-100' : ''}>
              <td className="px-4 py-2">{row.id}</td>
              <td className="px-4 py-2">
                {editableRowId === row.id ? (
                  <input
                    type="text"
                    value={editedValues.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className="border rounded py-1 px-2 w-full"
                  />
                ) : (
                  row.name
                )}
              </td>
              <td className="px-4 py-2">{row.email}</td>
              <td className="px-4 py-2">
                {editableRowId === row.id ? (
                  <button
                    className="text-green-500 bg-gray-200 px-2 py-1 rounded-full mr-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="text-blue-500 bg-gray-200 px-2 py-1 rounded-full mr-2"
                    onClick={() => handleEdit(row.id)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="text-red-500 bg-gray-200 px-2 py-1 rounded-full"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </td>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  onChange={() => handleRowSelect(row.id)}
                  checked={selectedRows.includes(row.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={Math.ceil(filteredData.length / rowsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
        initialPage={currentPageReactPaginate}
      />

      

      <div className="flex justify-end mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDeleteSelected}
          disabled={selectedRows.length === 0}
        >
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default App;
