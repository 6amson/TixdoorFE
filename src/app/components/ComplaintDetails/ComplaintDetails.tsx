'use client';
import { useState, useEffect } from 'react';
import styles from './complaintDetails.module.scss';
import { User, Complaint, Comment} from '@/utils/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface ComplaintDetailsProps {
    complaint: Complaint;
    user: User;
    onClose: () => void;
    onSubmit: () => void;
    onStatusChange: (complaintId: string, newStatus: string) => void;
}

const COMPLAINT_STATUSES = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { value: 'resolved', label: 'Resolved', color: '#10b981' },
    { value: 'rejected', label: 'Rejected', color: '#6b7280' }
];

const ComplaintDetails = ({ complaint, user, onClose, onStatusChange, onSubmit }: ComplaintDetailsProps) => {

    const [freshComplaint, setFreshComplaint] = useState<Complaint | null>(complaint);
    const { addComment, getComplaintById } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isNewComment, setIsNewComment] = useState(false)
    const commentsPerPage = 5;

    useEffect(() => {
        setComments(complaint?.complaintComments || []);
        setTotalPages(Math.ceil(complaint?.complaintComments.length / commentsPerPage));
    }, []);

    useEffect(() => {
        if (freshComplaint?.complaintComments) {
            setComments(freshComplaint.complaintComments);
            setTotalPages(Math.ceil(freshComplaint.complaintComments.length / commentsPerPage));
            //console.log(comments);

        } else {
            setComments([]);
            setTotalPages(1);
        }
    }, [isNewComment]);

    const getCurrentPageComments = () => {
        const startIndex = (currentPage - 1) * commentsPerPage;
        const endIndex = startIndex + commentsPerPage;
        return comments.slice(startIndex, endIndex);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const canUserComment = () => {
        // Users can't comment on resolved complaints
        if (complaint.status === 'resolved' || complaint.status === 'rejected') {
            return { canComment: false, reason: 'Cannot comment on resolved or closed complaints' };
        }

        // If user is admin, they can always comment
        if (user.userType === 'admin') {
            return { canComment: true, reason: '' };
        }

        // If user is regular user, check if admin has commented
        const hasAdminComment = comments.some(comment => comment.userType === 'admin');
        if (!hasAdminComment) {
            return { canComment: false, reason: 'Please wait for admin response before commenting' };
        }

        return { canComment: true, reason: '' };
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) {
            toast.error('Comment cannot be empty')
            return;
        }

        const commentCheck = canUserComment();
        if (!commentCheck.canComment) {
            toast.error(commentCheck.reason)
            return;
        }

        setIsSubmitting(true);

        try {
            setIsSubmitting(true);

            const [, newComplaint] = await Promise.all([
                addComment(complaint.id, newComment.trim()),
                getComplaintById(complaint.id),
            ]);

            setComments(newComplaint?.complaintComments || []);
            // setFreshComplaint(newComplaint);
            setNewComment('');
            setIsSubmitting(false);
            setIsNewComment(true);
            onSubmit();

            // Recalculate pagination
            const newTotal = newComplaint?.complaintComments?.length || 0;
            setTotalPages(Math.ceil(newTotal / commentsPerPage));

            // Go to last page to show new comment
            const lastPage = Math.ceil(newTotal / commentsPerPage);
            setCurrentPage(lastPage);
        } catch (e) {
            setIsSubmitting(false);
            throw e;
        }


    };

    const handleStatusChange = (newStatus: string) => {
        onStatusChange(complaint.id, newStatus);
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

    const getStatusColor = (status: string) => {
        const statusObj = COMPLAINT_STATUSES.find(s => s.value === status);
        return statusObj?.color || '#6b7280';
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const commentPermission = canUserComment();

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h2 className={styles.title}>Complaint Details</h2>
                        <div className={styles.headerMeta}>
                            <span className={styles.complaintId}>#{complaint.id}</span>
                            <span className={styles.date}>{formatDate(complaint.createdAt)}</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className={styles.content}>
                    {/* Complaint Info */}
                    <div className={styles.complaintInfo}>
                        <div className={styles.complaintHeader}>
                            <div className={styles.statusSection}>
                                <span
                                    className={styles.status}
                                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                                >
                                    {complaint.status.replace("_", " ")}
                                </span>

                                {/* Status Dropdown (Admin Only) */}
                                {user.userType === 'admin' && complaint.status !== 'resolved' && (
                                    <select
                                        value={complaint.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className={styles.statusSelect}
                                        disabled={isSubmitting}
                                    >
                                        {COMPLAINT_STATUSES.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className={styles.complaintMeta}>
                                <span className={styles.type}>{complaint.complaintType}</span>
                                <span className={styles.userEmail}>{user.email}</span>
                            </div>
                        </div>

                        <h3 className={styles.complaintTitle}>{complaint.complaintType.replace('_', ' ')}</h3>
                        <p className={styles.complaintDescription}>{complaint.complain}</p>

                        {/* Attachment */}
                        {complaint.attachment && (
                            <div className={styles.attachment}>
                                <img src={complaint.attachment} alt="Complaint Attachment" />
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className={styles.commentsSection}>
                        <div className={styles.commentsHeader}>
                            <h4>Comments ({comments.length})</h4>
                        </div>

                        {/* Comments List */}
                        <div className={styles.commentsList}>
                            {getCurrentPageComments().length === 0 ? (
                                <div className={styles.noComments}>
                                    <p>No comments yet</p>
                                </div>
                            ) : (
                                getCurrentPageComments().map(comment => (
                                    <div key={comment.id} className={`${styles.comment} ${styles[user.userType]}`}>
                                        <div className={styles.commentHeader}>
                                            <div className={styles.commentUser}>
                                                <span className={styles.userName}>{comment.userEmail}</span>

                                                <span className={`${styles.userRole} ${styles[comment.userType == 'admin'? 'admin' : 'user']}`}>
                                                    {comment.userType == 'admin' ? "admin".toUpperCase() : "user".toUpperCase()}
                                                </span>
                                            </div>
                                            <span className={styles.commentDate}>
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className={styles.commentContent}>{comment.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Comments Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.commentsPagination}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={styles.pageBtn}
                                >
                                    ←
                                </button>
                                <span className={styles.pageInfo}>
                                    {currentPage} of {totalPages}
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

                        {/* Comment Form */}
                        <div className={styles.commentForm}>
                            {/* {error && <div className={styles.error}>{error}</div>} */}

                            <form onSubmit={handleCommentSubmit}>
                                <div className={styles.inputGroup}>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={
                                            commentPermission.canComment
                                                ? "Write your comment..."
                                                : commentPermission.reason
                                        }
                                        className={styles.commentInput}
                                        rows={3}
                                        disabled={!commentPermission.canComment}
                                    />
                                </div>
                                <div className={styles.commentActions}>
                                    <button
                                        type="submit"
                                        disabled={!commentPermission.canComment || isSubmitting || !newComment.trim()}
                                        className={styles.submitComment}
                                    >
                                        {isSubmitting ? (
                                            <span className={styles.loader}></span>
                                        ) : (
                                            'Post Comment'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetails;
