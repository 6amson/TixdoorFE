export interface Comment {
    id: string;
    comment: string;
    userType: 'user' | 'admin';
    createdAt: string;
    userEmail: string;
}

export interface Complaint {
    id: string;
    complaintType: string;
    complain: string;
    status: 'pending' | 'in progress' | 'resolved' | 'rejected';
    createdAt: string;
    attachment?: string;
    complaintComments: Comment[];
}

export interface CreateComplaint {
    complaintType: string;
    complain: string;
    attachment?: File | null;
    complaintComments: Comment[];
}

export interface CreateComment {
    complaintId: string;
    comment: string;
};

export interface User {
    id: string;
    email: string;
    userType: 'user' | 'admin';
}

export interface AddCommentResponse {
    addComment: {
        success: boolean;
        comment: {
            id: string;
            comment: string;
            userType: "user" | "admin";
            createdAt: string;
        };
    };
}
export interface ProfileResponse {
    success: boolean;
    user: User;
    complaints: Complaint[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
    };
}
