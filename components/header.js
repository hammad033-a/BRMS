import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Icon, Label, Button, Dropdown } from 'semantic-ui-react';
import { useRouter } from 'next/router';

const Header = () => {
    const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [isStoreOwner, setIsStoreOwner] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if MetaMask is connected
        const metamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
        const address = localStorage.getItem('userAddress');
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        const storeOwnerEmail = localStorage.getItem('storeOwnerEmail');
        
        setIsMetaMaskConnected(metamaskConnected);
        setUserAddress(address);
        setIsLoggedIn(!!token);
        setUserEmail(email);
        setIsStoreOwner(!!storeOwnerEmail);
    }, []);

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('metamaskConnected');
        localStorage.removeItem('userAddress');
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        
        setIsMetaMaskConnected(false);
        setUserAddress('');
        setIsLoggedIn(false);
        setUserEmail('');
        
        router.push('/');
    };

    const getUserDisplay = () => {
        if (isMetaMaskConnected) {
            return `${userAddress?.substring(0, 6)}...${userAddress?.substring(userAddress.length - 4)}`;
        }
        return 'Connect Wallet';
    };

    return (
        <Menu inverted style={{ marginTop: '20px', marginBottom: '40px', borderRadius: '8px' }}>
            <Link href="/" legacyBehavior>
                <a className="item" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    <Icon name="block layout" />
                    <span style={{ marginLeft: '8px' }}>BRMS</span>
                    <Label color="blue" style={{ marginLeft: '10px' }}>Blockchain</Label>
                </a>
            </Link>

            <Menu.Menu position="right">
                {isStoreOwner && (
                    <Link href="/store/manage-stores" legacyBehavior>
                        <a className="item">
                            <Icon name="shop" />
                            Manage My Store
                        </a>
                    </Link>
                )}
                <Link href="/store/login" legacyBehavior>
                    <a className="item">
                        <Icon name="lock" />
                        Store Login
                    </a>
                </Link>
                        <Link href="/dashboard" legacyBehavior>
                            <a className="item">
                                <Icon name="home" />
                                Dashboard
                            </a>
                        </Link>
                {!isMetaMaskConnected ? (
                    <Link href="/login" legacyBehavior>
                        <a className="item">
                            <Icon name="ethereum" />
                            Connect Wallet
                        </a>
                    </Link>
                ) : (
                    <Dropdown item text={getUserDisplay()} style={{ color: 'white' }}>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleLogout}>
                                <Icon name="sign out" />
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </Menu.Menu>
        </Menu>
    );
};

export default Header;
