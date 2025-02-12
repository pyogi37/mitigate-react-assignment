import React from "react";
import { FiUsers } from "react-icons/fi"; // Change icon dynamically if needed

interface CardProps {
    label: string;
    value?: number;
    percentage?: string;
    icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ label, value, percentage, icon }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-500">
                {icon || <FiUsers size={24} />}
            </div>
            <div>
                <p className="text-xl font-semibold">
                    {value !== undefined ? value : percentage}
                </p>
                <p className="text-gray-500">{label}</p>
            </div>
            {percentage && value !== undefined && (
                <span className="ml-auto text-green-500">{percentage}</span>
            )}
        </div>
    );
};

export default Card;
