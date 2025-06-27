'use client';
import { useState } from 'react';
import styles from './createComplaintOverlay.module.scss';
import { MdOutlineCancel } from 'react-icons/md';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface CreateComplaintOverlayProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

const COMPLAINT_TYPES = [
    "service issue",
    "payment issue",
    "technical issue",
    "content issue",
    "other"
];

const CreateComplaintOverlay = ({ onClose, onSubmit }: CreateComplaintOverlayProps) => {
    const { createComplaint } = useAuth();

    const [formData, setFormData] = useState({
        type: '',
        description: '',
        attachment: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData({
            ...formData,
            attachment: file
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.type || !formData.description.trim()) {
            return;
        }
        try {
            setIsSubmitting(true);
            const complaint = await createComplaint(
                formData.type,
                formData.description,
                formData.attachment as File
            );

            if (complaint) {
                toast.success("New complaint submitted")
                setIsSubmitting(false);
                onClose();
                onSubmit(complaint);
            }
        } catch (error) {
            console.error('Submit failed:', error);
            setIsSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Create New Complaint</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <MdOutlineCancel />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="type" className={styles.label}>
                            Complaint Type *
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={styles.select}
                            required
                        >
                            <option value="">Select complaint type</option>
                            {COMPLAINT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Describe your complaint in detail..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="attachment" className={styles.label}>
                            Attachment (Optional)
                        </label>
                        <input
                            type="file"
                            id="attachment"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                        {formData.attachment && (
                            <p className={styles.fileName}>
                                Selected: {formData.attachment.name}
                            </p>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelBtn}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting || !formData.type || !formData.description.trim()}
                        >
                            {isSubmitting ? (
                                <span className={styles.loader}></span>
                            ) : (
                                'Submit Complaint'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateComplaintOverlay;
