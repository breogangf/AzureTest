const chai = require('chai');

const should = chai.should();
const expect = chai.expect;

const containerTestURL = ContainerURL.fromServiceURL(serviceURL, containerTestName);

describe('Container tests', () => {
  it('should be able to create a private container', (done) => {
    containerTestURL.create(aborter);
    done();
  });
});
