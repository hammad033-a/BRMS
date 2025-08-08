import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import Link from 'next/link';

class ThankYou extends Component {
    render() {
        return (
            <Layout>
                <Message positive>
                    <Message.Header>
                        <h3>Thank you for your purchase!</h3>
                    </Message.Header>
                    <Message.Content>
                        <h4>We value your feedback. Please keep an eye out for your personal invite to review this product :)</h4>
                    </Message.Content>
                </Message>
                <Link href="/" legacyBehavior>
                    <a>Return to Home</a>
                </Link>
            </Layout>
        );
    }
}

export default ThankYou;
