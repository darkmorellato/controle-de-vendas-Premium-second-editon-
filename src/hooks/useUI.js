import { useState, useCallback } from 'react';

export function useUI() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [clientSearchModalOpen, setClientSearchModalOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [clientHistoryModalOpen, setClientHistoryModalOpen] = useState(false);
    const [clientDataModalOpen, setClientDataModalOpen] = useState(false);
    const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
    const [selectedClientHistory, setSelectedClientHistory] = useState(null);
    const [managerAuthModalOpen, setManagerAuthModalOpen] = useState(false);
    const [managerPassword, setManagerPassword] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [sessionPromptOpen, setSessionPromptOpen] = useState(false);
    const [selectedUserForLogin, setSelectedUserForLogin] = useState(null);
    const [loginPasswordInput, setLoginPasswordInput] = useState('');
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [currentReceipt, setCurrentReceipt] = useState(null);
    const [dateLockModalOpen, setDateLockModalOpen] = useState(false);
    const [dateLockPassword, setDateLockPassword] = useState('');
    const [isBackupOpen, setIsBackupOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [confirmSaleModalOpen, setConfirmSaleModalOpen] = useState(false);
    const [confirmChangeModalOpen, setConfirmChangeModalOpen] = useState(false);
    const [confirmClientUpdateModalOpen, setConfirmClientUpdateModalOpen] = useState(false);
    const [commissionModalOpen, setCommissionModalOpen] = useState(false);
    const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
    const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
    const [birthdayAlertOpen, setBirthdayAlertOpen] = useState(false);
    const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
    const [alertModalOpen, setAlertModalOpen] = useState(false);
    const [alertData, setAlertData] = useState({ message: '', phase: '' });

    return {
        currentView, setCurrentView,
        clientSearchModalOpen, setClientSearchModalOpen,
        clientSearchTerm, setClientSearchTerm,
        clientHistoryModalOpen, setClientHistoryModalOpen,
        clientDataModalOpen, setClientDataModalOpen,
        selectedClientForEdit, setSelectedClientForEdit,
        selectedClientHistory, setSelectedClientHistory,
        managerAuthModalOpen, setManagerAuthModalOpen,
        managerPassword, setManagerPassword,
        loginModalOpen, setLoginModalOpen,
        sessionPromptOpen, setSessionPromptOpen,
        selectedUserForLogin, setSelectedUserForLogin,
        loginPasswordInput, setLoginPasswordInput,
        receiptModalOpen, setReceiptModalOpen,
        currentReceipt, setCurrentReceipt,
        dateLockModalOpen, setDateLockModalOpen,
        dateLockPassword, setDateLockPassword,
        isBackupOpen, setIsBackupOpen,
        logoutModalOpen, setLogoutModalOpen,
        confirmSaleModalOpen, setConfirmSaleModalOpen,
        confirmChangeModalOpen, setConfirmChangeModalOpen,
        confirmClientUpdateModalOpen, setConfirmClientUpdateModalOpen,
        commissionModalOpen, setCommissionModalOpen,
        isHelpDropdownOpen, setIsHelpDropdownOpen,
        isNotificationsDropdownOpen, setIsNotificationsDropdownOpen,
        birthdayAlertOpen, setBirthdayAlertOpen,
        notificationsModalOpen, setNotificationsModalOpen,
        alertModalOpen, setAlertModalOpen,
        alertData, setAlertData
    };
}
