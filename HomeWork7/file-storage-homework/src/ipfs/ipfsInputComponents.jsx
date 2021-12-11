import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { storeString, retrieveString, storeFile, getFile } from './ipfsMethods';

const IPFSInputs = () => {
  const [string, setString] = useState('');
  const [cid, setCid] = useState('');
  const [file, setFile] = useState('');
  const [fileCid, setFileCid] = useState('');
  const [image, setImage] = useState(null);

  const submitString = () => {
    storeString(string);
  }

  const submitFile = () => {
    storeFile(file, setImage);
  }

  const getString = () => {
    retrieveString(cid);
  }

  return (
    <Container>
      <Row>
        <Col>
          <label htmlFor="stringInput">String Input</label>
          <input
            type="text"
            name="stringInput"
            value={string}
            onChange={(event) => setString(event.target.value)}
          />
          <button onClick={() => submitString}>Submit String</button>
        </Col>
      </Row>

      <Row>
        <Col>
          <label htmlFor="cidInput">String Input</label>
          <input
            type="text"
            name="cidInput"
            value={cid}
            onChange={(event) => setCid(event.target.value)}
          />
          <button onClick={() => getString}>Submit String CID</button>
        </Col>
      </Row>

      <Row>
        <Col>
          <label htmlFor="fileInput">Upload File</label>
          <input
            type="file"
            name="fileInput"
            onChange={(event) => setFile(event.target.files[0])}
          />
          <button onClick={() => submitFile(file)}>Submit File</button>
        </Col>

        <div id="ipfs-image"></div>
      </Row>
      <Row>
        <Col>
          <label htmlFor="cidFileInput">Submit File CID</label>
          <input
            type="text"
            name="cidFileInput"
            value={fileCid}
            onChange={(event) => setFileCid(event.target.value)}
          />
          <button onClick={() => getFile(fileCid, setImage)}>Submit String CID</button>
        </Col>
      </Row>
      <Row>
        <Col>
          { image &&
            <img src={image} alt="nothing"/>
          }
        </Col>
      </Row>
    </Container>
  );
};

export default IPFSInputs;
