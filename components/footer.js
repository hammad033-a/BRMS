import React from 'react';
import Link from 'next/link';
import { Menu } from 'semantic-ui-react';

const Footer = () => {
    return (
        <div>
            <Menu inverted style={{ marginTop: '2em', marginBottom: '2em' }}>
                <Menu.Item header>BuyStuff.ie</Menu.Item>
                <Link href="/" legacyBehavior>
                    <a className="item">Home</a>
                </Link>
                <Link href="/about" legacyBehavior>
                    <a className="item">About</a>
                </Link>
                <Link href="/contact" legacyBehavior>
                    <a className="item">Contact</a>
                </Link>
            </Menu>
        </div>
    );
};

export default Footer;