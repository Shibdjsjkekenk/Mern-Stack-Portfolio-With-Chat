import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import moment from 'moment'
import { MdModeEdit } from "react-icons/md";
import ChangeUserRole from '../components/ChangeUserRole';


const AllUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [pageData, setPageData] = useState([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [openUpdateRole, setOpenUpdateRole] = useState(false);
    const [updateUserDetails, setUpdateUserDetails] = useState({
        email: "",
        name: "",
        role: "",
        _id: ""
    });

    const fetchAllUsers = async () => {
        try {
            const fetchData = await fetch(SummaryApi.allUser.url, {
                method: SummaryApi.allUser.method,
                credentials: 'include'
            });
            const dataResponse = await fetchData.json();
            if (dataResponse.success) {
                setAllUsers(dataResponse.data);
            } else if (dataResponse.error) {
                toast.error(dataResponse.message);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        }
    };

    const handleNext = () => {
        if (page < pageCount) {
            setPage(page + 1);
        }
    };

    const handlePrevious = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, [page]);

    useEffect(() => {
        const pageDataCount = Math.ceil(allUsers.length / 3);
        setPageCount(pageDataCount);

        const LIMIT = 3;
        const skip = LIMIT * (page - 1);
        const dataSkip = allUsers.slice(skip, skip + LIMIT);
        setPageData(dataSkip);
    }, [allUsers, page]);

    return (
        <div className='bg-white pb-4'>
            <table className="w-full rounded-lg userTable overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                    <tr className="text-white" style={{ backgroundColor: "#6A38C2" }}>
                        <th>Sr.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {pageData.length > 0 ? (
                        pageData.map((el, index) => (
                            <tr key={el._id}>
                                <td>{index + 1 + (page - 1) * 3}</td>
                                <td>{el.name}</td>
                                <td>{el.email}</td>
                                <td>{el.role}</td>
                                <td>{moment(el.createdAt).format('LL')}</td>
                                <td>
                                    <button
                                        className='bg-green-100 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white'
                                        onClick={() => {
                                            setUpdateUserDetails(el);
                                            setOpenUpdateRole(true);
                                        }}
                                    >
                                        <MdModeEdit />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">No users found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* <div className='d-flex justify-content-end pt-3'>
                <Pagination>

                    <Pagination.Prev onClick={handlePrevious} disabled={page === 1} />
                    {
                        Array(pageCount).fill(null).map((ele, index) => {
                            return (
                                <>
                                    <Pagination.Item active={page === index + 1 ? true : false} onClick={() => setPage(index + 1)}>{index + 1}</Pagination.Item>
                                </>
                            )
                        })
                    }
                    <Pagination.Next onClick={handleNext} disabled={page === pageCount} />
                </Pagination>

                <div class="pagination">
                    <div className='buttons' onClick={handlePrevious} disabled={page === 1} >Prev.</div>
                    <ul>
                        {
                            Array(pageCount).fill(null).map((ele, index) => {
                                return (
                                    <>
                                        <li active={page === index + 1 ? true : false} onClick={() => setPage(index + 1)}>{index + 1}</li>
                                    </>
                                )
                            })
                        }
                    </ul>
                    <div className='buttons' onClick={handleNext} disabled={page === pageCount} >Next</div>
                </div>

              
            </div> */}
            <div class="pagination display  d-flex justify-content-end pt-3'">
                <div className='new'>
                    <a className='cursor-pointer tabs' onClick={handlePrevious} disabled={page === 1}>Previours</a>
                    {
                        Array(pageCount).fill(null).map((ele, index) => {
                            return (
                                <>
                                    <a
                                        key={index}
                                        className={`cursor-pointer num ${page === index + 1 ? 'active' : ''}`}
                                        onClick={() => setPage(index + 1)}
                                        style={page === index + 1 ? { backgroundColor: "white", color: "red", borderRadius: "50%", lineHeight: "10px", padding: "10px", marginTop: "10px" } : {}}
                                    >
                                        {index + 1}
                                    </a>                                </>
                            )
                        })
                    }

                    <a className='cursor-pointer tabs' onClick={handleNext} disabled={page === pageCount} >Next</a>
                </div>
            </div>



            {openUpdateRole && (
                <ChangeUserRole
                    onClose={() => setOpenUpdateRole(false)}
                    name={updateUserDetails.name}
                    email={updateUserDetails.email}
                    role={updateUserDetails.role}
                    userId={updateUserDetails._id}
                    callFunc={fetchAllUsers}
                />
            )}


        </div>


    );
};

export default AllUsers;