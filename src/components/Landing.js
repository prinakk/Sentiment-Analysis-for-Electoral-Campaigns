import React, { Component } from 'react';

import { Button, Col, Row, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import ReactWordcloud from 'react-wordcloud';

const wordCloudOptions = {
  colors: [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#ecf0f1',
    '#95a5a6',
    '#f39c12',
    '#d35400',
    '#c0392b',
    '#bdc3c7',
    '#7f8c8d'
  ],
  deterministic: false,
  fontFamily: 'impact',
  fontSizes: [5, 60],
  fontStyle: 'normal',
  fontWeight: 'normal',
  padding: 1,
  rotations: 3,
  rotationAngles: [0, 90],
  scale: 'sqrt',
  spiral: 'archimedean',
  transitionDuration: 1000
};

export default class Landing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      textinput: '',
      sentiment: '',
      wordObject: null,
      isLoading: false
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnchange = this.handleOnchange.bind(this);
  }

  handleOnchange(event) {
    this.setState({ [event.target.name]: event.target.value, errors: {} });
  }

  handleSubmit() {
    if (this.state.textinput === '') {
      return;
    }
    this.setState({ isLoading: true });
    this.getSentiment();

    let tempMarkers = {};
    let textarray = this.state.textinput.split(' ');
    tempMarkers = textarray.reduce(function(result, item) {
      result[item + ''] = result[item + ''] || {};
      let tempPbj = result[item + ''];
      tempPbj.count = tempPbj.count || 0;
      tempPbj.count++;
      return result;
    }, {});

    const result = [];

    Object.keys(tempMarkers).forEach(key => {
      result.push({
        text: key,
        value:
          tempMarkers[key].count *
          Math.floor(Math.random(50) * Math.floor(tempMarkers[key].count * 100))
      });
    });
    console.log('result', result);
    this.setState({ wordObject: result });
  }

  getSentiment() {
    this.setState({ sentiment: 'Loading Sentiment Analysis...' });
    var bodyFormData = new FormData();
    bodyFormData.set('text', this.state.textinput);
    axios({
      method: 'POST',
      url: `http://localhost:5000/getSentiment`,
      data: bodyFormData,
      config: { headers: { 'Content-Type': 'multipart/form-data' } }
    })
      .then(res => {
        console.log('result', res);
        let resultContent = '';
        if (res.data === 'positive') {
          resultContent = (
            <div>
              <span>Analysis result is Positive</span>{' '}
              <i style={{ color: '#1da1f2' }} class="fas fa-thumbs-up text-success"></i>
            </div>
          );
        } else {
          resultContent = (
            <div>
              <span>Analysis result is Negative</span>{' '}
              <i style={{ color: '#1da1f2' }} class="fas fa-thumbs-down text-danger"></i>
            </div>
          );
        }
        this.setState({ isLoading: false, sentiment: resultContent });
      })
      .catch(error => {
        console.log('Error in getting analysis result', error);
        let resultContent = (
          <div>
            <i className="fas fa-exclamation-triangle text-warning"></i>
            <span>Opps Something went wrong in connecting the Flask Server</span>
          </div>
        );
        this.setState({ isLoading: false, sentiment: resultContent });
      });
  }

  render() {
    let content = '';
    let resultContent = '';

    if (this.state.sentiment !== '') {
      resultContent = (
        <Col className="text-center py-5">
          <h4>{this.state.sentiment}</h4>
        </Col>
      );
    }
    content = (
      <Col className="content" md="12">
        <Row>
          <Col md="3"></Col>
          <Col md="6">
            <FormGroup>
              <Label for="exampleText">
                <h4>Enter your text</h4>
              </Label>
              <Input
                onChange={this.handleOnchange}
                rows="6"
                cols="50"
                type="textarea"
                name="textinput"
                id="textinput"
              />
            </FormGroup>
          </Col>
          <Col md="3"></Col>
        </Row>
        <Row>
          <Col className="text-center">
            <Button
              style={{ width: '12em' }}
              onClick={() => {
                this.handleSubmit();
              }}
              color="primary"
              disabled={this.state.isLoading}
            >
              {this.state.isLoading ? (
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                'Submit'
              )}
            </Button>
          </Col>
        </Row>
      </Col>
    );

    return (
      <div>
        <Row style={{ minHeight: '40vh' }}>{content}</Row>
        <Row style={{ minHeight: '10vh' }}>{resultContent}</Row>
        <Row style={{ minHeight: '20vh' }}>
          <Col>
            {this.state.wordObject !== null ? (
              <ReactWordcloud options={wordCloudOptions} words={this.state.wordObject} />
            ) : (
              ''
            )}
          </Col>
        </Row>
      </div>
    );
  }
}
