// File: context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { graphqlRequest, graphqlRequestWithFile } from '@/utils/graphql';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Comment, Complaint, User } from '@/utils/types';

// interface User {
//     id: string;
//     email: string;
//     user_type: string;
// }

interface AuthContextType {
    user: User | null;
    getProfile: (page?: number, perPage?: number) => Promise<any>;
    signin: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, adminCode?: string) => Promise<void>;
    signout: () => void;
    addComment: (complaintId: string, commentText: string) => Promise<Comment | null>;
    getComplaintById: (id: string) => Promise<Complaint | null>;
    createComplaint: (complaintType: string, complain: string, attachment: File) => Promise<Complaint | null>;
    updateComplaintStatus: (complaintId: string, newStatus: string) => Promise<Complaint | null>;
    downloadCSV: () => Promise<void>;
    setUser: Dispatch<SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();
    useEffect(() => {
        const stored = localStorage.getItem('tix_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const signin = async (email: string, password: string) => {
        const query = `
        mutation SignIn($email: String!, $password: String!) {
        signIn(input: {email: $email, password: $password}) {
          token
          user {
            id
            email
            userType
          }
        }
      }
`;

        const variables = { email, password };
        const data = await graphqlRequest(query, variables);

        if (data?.signIn?.user && data?.signIn?.token) {
            setUser(data.signIn.user);
            localStorage.setItem('tix_token', data.signIn.token);
            localStorage.setItem('tix_user', JSON.stringify(data.signIn.user));
            toast.success('Signed in successfully');
            router.push('/dashboard');
        }
    };

    const signup = async (email: string, password: string, adminCode?: string) => {
        const query = `
      mutation SignUp($email: String!, $password: String!, $adminCode: String) {
        signUp(input: {email: $email, password: $password, adminCode: $adminCode}) {
          user {
            id
            email
            userType
          }
          token
        }
      }
    `;

        const variables = { email, password, adminCode };
        const data = await graphqlRequest(query, variables);

        if (data?.signUp?.user && data?.signUp?.token) {
            setUser(data.signUp.user);
            localStorage.setItem('tix_token', data.signUp.token);
            localStorage.setItem('tix_user', JSON.stringify(data.signUp.user));
            toast.success('Account created successfully');
            router.push('/dashboard');
        } else {
            return;
        }
    };

    const signout = async () => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            router.push('/');
            return;
        }
        const query = `mutation {
  signOut(input: {}) {
    success
    message
    clientMutationId
  }
}`
        try {
            await graphqlRequest(query, {}, token!);
            setUser(null);
            localStorage.removeItem('tix_token');
            localStorage.removeItem('tix_user');
            toast.success('Signed out');
            router.push('/');
        } catch (e) {
            router.push('/');
            throw e;
        }
    };

    const getProfile = async (page = 1, perPage = 10) => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            router.push('/signin');
            return;
        }

        try {
            const result = await graphqlRequest(
                `
        query GetProfile($page: Int!, $perPage: Int!) {
            profile(page: $page, perPage: $perPage) {
                success
            user {
                    id
                    email
                    userType
                    createdAt
                }
            complaints {
                    id
                    status
                    attachment
                    complaintType
                    complain
                    createdAt
              complaintComments {
                        id
                        comment
                        userType
                        createdAt
                    }
                }
            pagination {
                    currentPage
                    totalPages
                    totalCount
                }
            }
        }
        `,
                { page, perPage },
                token
            );

            return result.profile;
        } catch (err) {
            router.push('/');
            throw err;
        }
    };

    const addComment = async (complaintId: string, commentText: string): Promise<Comment | null> => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            router.push("/")
            return null;
        }
        const query = `
      mutation AddComment($complaintId: ID!, $comment: String!) {
            addComment(input: { complaintId: $complaintId, comment: $comment }) {
                success
                comment {
                    id
                    comment
                    userType
                    createdAt
                    userEmail
                }
            }
        }
        `;

        try {
            const res = await graphqlRequest(query, { complaintId, comment: commentText }, token!);
            toast.success("Comment added!");
            return res.addComment.comment;
        } catch (err: any) {
            console.error("❌ Failed to add comment:", err.message);
            throw err;
        }
    };

    const getComplaintById = async (id: string): Promise<Complaint | null> => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            router.push("/")
            return null;
        }
        const query = `
    query GetComplaint($id: ID!) {
            complaint(id: $id) {
                id
                complaintType
                complain
                status
                attachment
                createdAt
        complaintComments {
                    id
                    comment
                    userType
                    createdAt
                }
            }
        }
        `;

        const variables = { id };
        const data = await graphqlRequest<{ complaint: Complaint }>(query, variables, token);
        return data.complaint ?? null;
    }

    const createComplaint = async (complaintType: string, complain: string, attachment?: File) => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            return null;
        }
        const query = `
        mutation CreateComplaint($complaintType: String!, $complain: String!, $attachment: Upload) {
            createComplaint(input: {
                complaintType: $complaintType, 
                complain: $complain, 
                attachment: $attachment
            }) {
                success
                complaint {
                    id
                    complaintType
                    complain
                    status
                    attachment
                    complaintComments {
                        id
                        comment
                        userType
                        createdAt
                    }
                    createdAt
                    user {
                        id
                        email
                        userType
                    }
                }
            }
        }
    `;

        const variables = {
            complaintType,
            complain,
            ...(attachment && { attachment })
        };

        try {
            const data = await graphqlRequestWithFile(query, variables, token!);

            if (data?.createComplaint?.success && data?.createComplaint?.complaint) {
                //console.log('Complaint created:', data.createComplaint.complaint);
                // toast.success('Complaint submitted successfully');
                return data.createComplaint.complaint;
            } else {
                // toast.error('Failed to create complaint');
                return null;
            }
        } catch (error) {
            console.error('Error creating complaint:', error);
            // toast.error('An error occurred while submitting complaint');
            throw error;
        }
    };

    const updateComplaintStatus = async (complaintId: string, status: string) => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            return null;
        }
        const query = `
    mutation UpdateComplaintStatus($complaintId: ID!, $status: String!) {
      updateComplaintStatus(input: { complaintId: $complaintId, status: $status }) {
        success
        complaint {
          id
          status
        }
      }
    }
  `;

        const variables = { complaintId, status };

        try {
            const res = await graphqlRequest(query, variables, token);
            return res?.updateComplaintStatus?.complaint;
        } catch (err) {
            console.error("Failed to update complaint status:", err);
            throw err;
        }
    };

    const downloadCSV = async () => {
        const token = localStorage.getItem('tix_token');
        if (!token) {
            toast.error("You are not authenticated, login to continue");
            return null;
        }
        const query = `mutation {
  exportClosedComplaints(input: {}) {
    csvData
    filename
    success
    message
  }
}`;

        try {
            const res = await graphqlRequest(query, {}, token);
            // console.log("CSV Data received:", res.exportClosedComplaints.csvData);
            function downloadCsv(csvString: string, filename: string) {
                const blob = new Blob([csvString], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename || "resolved_complaints.csv";
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
            downloadCsv(res?.exportClosedComplaints?.csvData, res?.exportClosedComplaints?.filename);
            return res?.exportClosedComplaints?.csvData;
        } catch (err) {
            console.error("Failed to download CSV:", err);
            throw err;
        }
    };


    return (
        <AuthContext.Provider value={{ user, signin, signup, signout, getProfile, addComment, getComplaintById, createComplaint, updateComplaintStatus, downloadCSV, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

