'use client';
import { useState, useEffect } from 'react';
import styles from './dashboard.module.scss';
import CreateComplaintOverlay from '../CreateComplaint/CreateComplaint';
import ComplaintDetails from '../ComplaintDetails/ComplaintDetails';
import { useAuth } from '@/context/AuthContext';
import { User, Complaint, } from '@/utils/types';

const Dashboard = () => {
    const { getProfile, updateComplaintStatus, setUser, user, setComplaints, complaint, complaints } = useAuth();
    const [isNewComplaint, setIsNewComplaint] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState<null | Complaint>(null);
    const [isCreateOverlayOpen, setIsCreateOverlayOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const complaintsPerPage = 10;

    // Mock data - replace with actual API calls
    useEffect(() => {
        getProfile(1, 20).then((data) => {
            //console.log('Profile data:', data);
            const user: User = {
                id: data.user.id,
                email: data.user.email,
                userType: data.user.userType === 'admin' ? 'admin' : 'user',
            };
            const Complaints: Complaint[] = data.complaints.map((complaint: Complaint) => ({
                id: complaint.id,
                complaintType: complaint.complaintType,
                complain: complaint.complain,
                status: complaint.status,
                createdAt: complaint.createdAt,
                attachment: complaint.attachment || null,
                complaintComments: complaint.complaintComments || []
            }));
            localStorage.setItem('tix_complaints', JSON.stringify(Complaints));
            setComplaints(Complaints);
            if (user) { setUser(user); }
            setTotalPages(Math.ceil(Complaints.length / complaintsPerPage));
        }).catch((error) => {
            console.error('Error fetching profile:', error);
        });
    }, [isNewComplaint || complaint]);

    const handleCloseModal = () => {
        setSelectedComplaint(null);
    };

    const handleCommentSubmit = () => {
        setIsNewComplaint(prev => !prev);
    }

    const handleStatusChange = async (complaintId: string, newStatus: string) => {
        if (user?.userType) {
            await updateComplaintStatus(complaintId, newStatus)
            setIsNewComplaint(prev => !prev);
        }
    };

    const handleCreateComplaint = () => {
        setIsNewComplaint(prev => !prev);
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'in_progress': return '#3b82f6';
            case 'resolved': return '#10b981';
            case 'rejected': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCurrentPageComplaints = () => {
        const startIndex = (currentPage - 1) * complaintsPerPage;
        const endIndex = startIndex + complaintsPerPage;
        return complaints.slice(startIndex, endIndex);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (!user) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.container}>
                {/* Dashboard Header */}
                <div className={styles.dashboardHeader}>
                    <div className={styles.userInfo}>
                        <h1 className={styles.title}>
                            {user.userType === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                        </h1>
                        <p className={styles.userEmail}>
                            Welcome, <span>{user.email}</span>
                        </p>
                    </div>

                    <div className={styles.userRole}>
                        <span className={`${styles.badge} ${styles[user.userType]}`}>
                            {user.userType.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className={styles.mainContent}>
                    {selectedComplaint && (
                        <ComplaintDetails
                            complaint={selectedComplaint}
                            user={user}
                            onClose={handleCloseModal}
                            onSubmit={handleCommentSubmit}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                    {/* Complaints Section */}
                    <div className={styles.complaintsSection}>
                        <div className={styles.sectionHeader}>
                            <h2>
                                {user.userType === 'admin' ? 'All Complaints' : 'My Complaints'}
                            </h2>
                            <span className={styles.count}>
                                {complaints.length} total
                            </span>
                        </div>

                        {/* Complaints List */}
                        <div className={styles.complaintsList}>
                            {getCurrentPageComplaints().length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No complaints found</p>
                                </div>
                            ) : (
                                getCurrentPageComplaints().map((complaint) => (
                                    <div onClick={() => setSelectedComplaint(complaint)} key={complaint.id} className={styles.complaintCard}>
                                        <div className={styles.cardHeader}>
                                            <h3 className={styles.complaintTitle}>{complaint.complaintType.replace("_", " ")}</h3>
                                            <span
                                                className={styles.status}
                                                style={{ backgroundColor: getStatusColor(complaint.status.replace("_", " ")) }}
                                            >
                                                {complaint.status}
                                            </span>
                                        </div>

                                        <p className={styles.complaintDesc}>
                                            {complaint.complain}
                                        </p>

                                        <div className={styles.cardFooter}>
                                            <span className={styles.complaintType}>
                                                {complaint.complaintType.replace("_", " ")}
                                            </span>
                                            <div className={styles.metadata}>
                                                {user.userType === 'admin' && (
                                                    <span className={styles.userEmail}>
                                                        {user.email}
                                                    </span>
                                                )}
                                                <span className={styles.date}>
                                                    {formatDate(complaint.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={styles.pageBtn}
                                >
                                    ←
                                </button>

                                <span className={styles.pageInfo}>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={styles.pageBtn}
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Complaint Button (Only for regular users) */}
                {user.userType === 'user' && (
                    <button
                        className={styles.createBtn}
                        onClick={() => setIsCreateOverlayOpen(true)}
                        aria-label="Create new complaint"
                    >
                        <span className={styles.plusIcon}>+</span>
                    </button>
                )}
            </div>

            {/* Create Complaint Overlay */}
            {isCreateOverlayOpen && (
                <CreateComplaintOverlay
                    onClose={() => setIsCreateOverlayOpen(false)}
                    onSubmit={handleCreateComplaint}
                />
            )}
        </div>
    );
};

export default Dashboard;