import React, { useState, useEffect } from 'react';
import { Container, Header, Segment, Message, Icon, Card, Grid, Button, Statistic, Table } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import MetaMaskManager from '../../components/MetaMaskManager';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const fetchStoresFromAPI = async () => {
  const res = await fetch('/api/stores');
  if (!res.ok) throw new Error('Failed to fetch stores');
  return await res.json();
};

const fetchStoreStats = async (storeId) => {
  // Dummy implementation: Replace with real API/database queries
  return {
    totalEarnings: 12345.67, // in ETH
    totalSales: 234,
    totalVisitors: Math.floor(Math.random() * 10000) + 1000,
    totalReviews: Math.floor(Math.random() * 200) + 10,
    productsSold: Math.floor(Math.random() * 500) + 20,
    monthlySales: Array.from({ length: 12 }, (_, i) => Math.floor(Math.random() * 1000) + 100),
    yearlySales: 12000 + Math.floor(Math.random() * 5000),
    months: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
  };
};

const AnimatedStatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'linear-gradient(135deg, #fff 60%, ' + color + '22 100%)',
    boxShadow: `0 8px 32px ${color}55`,
    borderRadius: 18,
    padding: '2em 1.5em',
    margin: '1em 0',
    minWidth: 180,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'perspective(600px) rotateY(-8deg) scale(1.04)',
    transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
    fontWeight: 'bold',
    fontSize: '1.3em',
    color: color,
    position: 'relative',
    overflow: 'hidden',
    border: `2px solid ${color}33`,
  }}>
    <Icon name={icon} size="big" style={{ color, marginBottom: 10, filter: 'drop-shadow(0 0 12px ' + color + '88)' }} />
    <span style={{ fontSize: 28, color }}>{value}</span>
    <span style={{ fontSize: 16, color: '#222', fontWeight: 500, marginTop: 6 }}>{label}</span>
  </div>
);

const AdminDashboard = () => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('storeId') : null;
    const email = typeof window !== 'undefined' ? localStorage.getItem('storeOwnerEmail') : null;
    if (!id || !email) {
      router.replace('/store/login');
    } else {
      setStoreId(id);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    if (authChecked && storeId) {
      setLoading(true);
      fetchStoreStats(storeId).then((data) => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [authChecked, storeId]);

  if (!authChecked || loading || !stats) {
    return <div style={{marginTop: '4em', textAlign: 'center'}}><Header as="h2"><Icon name="lock" />Loading dashboard...</Header></div>;
  }

  const chartData = {
    labels: stats.months,
    datasets: [
      {
        label: 'Monthly Sales (ETH)',
        data: stats.monthlySales,
        backgroundColor: 'rgba(77, 184, 255, 0.7)',
        borderColor: '#4db8ff',
        borderWidth: 3,
        borderRadius: 12,
        hoverBackgroundColor: 'rgba(77, 184, 255, 1)',
        hoverBorderColor: '#0077b6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#4db8ff', font: { size: 16, weight: 'bold' } } },
      title: { display: true, text: 'Store Sales (Monthly)', color: '#4db8ff', font: { size: 22, weight: 'bold' } },
      tooltip: { enabled: true, backgroundColor: '#fff', titleColor: '#4db8ff', bodyColor: '#222', borderColor: '#4db8ff', borderWidth: 2 },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#4db8ff', font: { size: 15 } }, grid: { color: '#e0f7fa' } },
      x: { ticks: { color: '#4db8ff', font: { size: 15 } }, grid: { color: '#e0f7fa' } },
    },
  };

  return (
    <Layout>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2em' }}>
          <Button color="teal" size="large" onClick={() => router.push('/admin/orders')}>
            <Icon name="shipping" /> Pending Orders
          </Button>
        </div>
        <Header as="h1" textAlign="center" style={{ marginTop: '2em', color: '#0077b6', textShadow: '0 8px 32px #4db8ff33' }}>
          <Icon name="dashboard" /> Store Owner Dashboard
        </Header>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2em', margin: '2em 0' }}>
          <AnimatedStatCard icon="ethereum" label="Total Earnings" value={stats.totalEarnings + ' ETH'} color="#4db8ff" />
          <AnimatedStatCard icon="shopping cart" label="Total Sales" value={stats.totalSales} color="#00b894" />
          <AnimatedStatCard icon="users" label="Total Visitors" value={stats.totalVisitors} color="#00b5ad" />
          <AnimatedStatCard icon="star" label="Total Reviews" value={stats.totalReviews} color="#fbbd08" />
          <AnimatedStatCard icon="box" label="Products Sold" value={stats.productsSold} color="#21ba45" />
              </div>
        <Segment raised style={{ maxWidth: '1200px', margin: '2em auto', padding: '2em', borderRadius: 18, boxShadow: '0 16px 64px #4db8ff22' }}>
          <Bar data={chartData} options={chartOptions} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <div style={{ fontSize: 22, color: '#0077b6', fontWeight: 'bold' }}>Yearly Sales: <span style={{ color: '#4db8ff' }}>{stats.yearlySales} ETH</span></div>
            <div style={{ fontSize: 22, color: '#00b894', fontWeight: 'bold' }}>Current Month: <span style={{ color: '#00b894' }}>{stats.monthlySales[new Date().getMonth()]} ETH</span></div>
            </div>
        </Segment>
      </Container>
    </Layout>
  );
};

export default AdminDashboard; 