import React from 'react';
import { Segment, Header, Icon } from 'semantic-ui-react';

// Simple mock chart component that doesn't rely on external libraries
const ChartComponent = ({ data }) => {
  return (
    <Segment style={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', padding: '2em', marginTop: '2em' }}>
      <Header as="h3" style={{ color: 'white' }}>
        <Icon name="chart line" />
        <Header.Content>
          Review Statistics
          <Header.Subheader>Visual representation of product reviews</Header.Subheader>
        </Header.Content>
      </Header>
      
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-around',
        padding: '20px 0'
      }}>
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} style={{ textAlign: 'center' }}>
            <div style={{ 
              height: `${rating * 20}%`, 
              width: '40px', 
              backgroundColor: '#4db8ff',
              borderRadius: '4px 4px 0 0'
            }}></div>
            <div style={{ color: 'white', marginTop: '10px' }}>{rating}★</div>
          </div>
        ))}
      </div>
      
      <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
        <p>This is a simplified mock chart. In a production environment, this would display actual review data.</p>
      </div>
    </Segment>
  );
};

export default ChartComponent;
