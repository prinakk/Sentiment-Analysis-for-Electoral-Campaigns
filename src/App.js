import React from 'react';
import './App.css';
import Landing from './components/Landing';
import { Col, Row } from 'reactstrap';

function App() {
  return (
    <div className="App">
      <Col className="layout-page" md="12">
        <Row className="header-block item-center">
          <Col
            style={{
              backgroundColor: 'rgba(255,255,255, 0.0)',
              height: '100%'
            }}
            className="text-center py-5"
          >
            <i style={{ color: '#1da1f2', fontSize: '4em' }} class="fas fa-poll-h"></i>
            <h1 className="pb-5">Sentiment Analysis for Electoral Campaigns</h1>
            <Landing />
          </Col>
        </Row>
      </Col>
    </div>
  );
}

export default App;
