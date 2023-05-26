const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const { getColl } = require('../connection');
const { ObjectId } = require('mongodb');
const {
  projectName,
  url,
  issueWithEveryField,
  issueWithRequiredFields,
  issueWithMissingRequiredField,
  issue1,
  issue2,
  issue3
} = require('./data');


suite('Functional Tests', function() {

  
  suiteSetup(async function() {

    try {
      const coll = getColl();
      await coll.deleteMany({});
    }
    catch (err) {
      console.error(err);
      throw err;
    }
  });


  suite('Create an issue tests', function() {

    const allKeys = [
      '_id', 'issue_title', 'issue_text', 'created_by',
      'assigned_to', 'status_text',
      'created_on', 'updated_on', 'open'
    ];

    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      
      chai
        .request(server)
        .post(url)
        .send(issueWithEveryField)
        .end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.hasAllKeys(res.body, allKeys);
					assert.instanceOf(new ObjectId(res.body['_id']), ObjectId);
					assert.propertyVal(res.body, 'issue_title', issueWithRequiredFields['issue_title']);
					assert.propertyVal(res.body, 'issue_text', issueWithRequiredFields['issue_text']);
					assert.propertyVal(res.body, 'created_by', issueWithRequiredFields['created_by']);
					assert.propertyVal(res.body, 'assigned_to', issueWithEveryField['assigned_to']);
					assert.propertyVal(res.body, 'status_text', issueWithEveryField['status_text']);
					assert.notEqual((new Date(res.body['created_on'])).toString(), 'Invalid Date');
					assert.notEqual((new Date(res.body['updated_on'])).toString(), 'Invalid Date');
					assert.propertyVal(res.body, 'open', true);
					done();
        });
    });
    
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      
      chai
        .request(server)
        .post(url)
        .send(issueWithRequiredFields)
        .end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.hasAllKeys(res.body, allKeys);
					assert.instanceOf(new ObjectId(res.body['_id']), ObjectId);
					assert.propertyVal(res.body, 'issue_title', issueWithRequiredFields['issue_title']);
					assert.propertyVal(res.body, 'issue_text', issueWithRequiredFields['issue_text']);
					assert.propertyVal(res.body, 'created_by', issueWithRequiredFields['created_by']);
					assert.propertyVal(res.body, 'assigned_to', '');
					assert.propertyVal(res.body, 'status_text', '');
					assert.notEqual((new Date(res.body['created_on'])).toString(), 'Invalid Date');
					assert.notEqual((new Date(res.body['updated_on'])).toString(), 'Invalid Date');
					assert.propertyVal(res.body, 'open', true);
					done();
        });
    });

    test('Create an issue with missing required field: POST request to /api/issues/{project}', function(done) {
      
      chai
        .request(server)
        .post(url)
        .send(issueWithMissingRequiredField)
        .end(function(err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'required field(s) missing' });
					done();
        });
    });
  });

    
  suite('View issues tests', function() {

    suiteSetup(async function() {

      try {
        const coll = getColl();
        await coll.deleteMany({});
        await coll.insertMany([issue1, issue2]);
      }
      catch (err) {
        console.error(err);
        throw err;
      }
    });

    const allKeys = [
      '_id', 'issue_title', 'issue_text', 'created_by',
      'assigned_to', 'status_text',
      'created_on', 'updated_on', 'open'
    ];

    test('View all issues on a project: GET request to /api/issues/{project}', function(done) {
      chai
				.request(server)
				.get(url)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.isArray(res.body);
					assert.lengthOf(res.body, 2);
					for (let doc of res.body) {
						assert.hasAllKeys(doc, allKeys);
					}
					done();
				});
    });

    test('View all issues on a project with one filter: GET request to /api/issues/{project}?open=true', function(done) {
      
			const oneFilter = { open: 'true' };
      
			chai
				.request(server)
				.get(url)
				.query(oneFilter)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.isArray(res.body);
					assert.lengthOf(res.body, 2);
					for (let doc of res.body) {
						assert.hasAllKeys(doc, allKeys);
						assert.propertyVal(doc, 'open', true);
					}
					done();
				});
    });

    test('View all issues on a project with multiple filters: GET request to /api/issues/{project}?open=true&assigned_to=psaya', function(done) {
      
      const multiFilter = {
        open: 'true',
        assigned_to: 'psaya'
      };
      
			chai
				.request(server)
				.get(url)
				.query(multiFilter)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.isArray(res.body);
					assert.lengthOf(res.body, 1);
					for (let doc of res.body) {
						assert.hasAllKeys(doc, allKeys);
						assert.propertyVal(doc, 'open', true);
						assert.propertyVal(doc, 'assigned_to', 'psaya');
					}
					done();
				});
    });
  });

    
  suite('Update an issue tests', function() {

    let idToUpdate;

    suiteSetup(async function() {

      try {
        const coll = getColl();
        await coll.deleteMany({});
        const result = await coll.insertOne(issue1);
        this.idToUpdate = result.insertedId.toString();
      }
      catch (err) {
        console.error(err);
        throw err;
      }
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      
			const id = this.idToUpdate;
			const updateData = {
				_id: id,
				status_text: 'Issue status has changed 1',
				assigned_to: 'pink panther'
			};
      
			chai
				.request(server)
				.put(url)
				.send(updateData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { result: 'successfully updated', _id: id });
					done();
				});
    });

    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      
			const id = this.idToUpdate;
			const updateData = {
				_id: id,
				status_text: 'Issue status has changed 2'
			};
      
			chai
				.request(server)
				.put(url)
				.send(updateData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { result: 'successfully updated', _id: id });
					done();
				});
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
      
			const updateData = { status_text: 'Issue status has changed 3' };
      
			chai
				.request(server)
				.put(url)
				.send(updateData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'missing _id' });
					done();
				});
    });

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
      
			const id = this.idToUpdate;
			const updateData = { _id: id };
			chai
				.request(server)
				.put(url)
				.send(updateData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: id });
					done();
				});
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      
			const nonExistingId = '62a99308c4b35f427d37affe';
			const updateData = { 
				_id: nonExistingId,
				status_text: 'Issue status has changed 4'
			};

      assert.notEqual(this.idToUpdate, nonExistingId, 'The id being updated is not same as the one existing in database');
      
			chai
				.request(server)
				.put(url)
				.send(updateData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'could not update', _id: nonExistingId });
					done();
				});
    });
  });

    
  suite('Delete an issue tests', function() {

    let idToDelete;

    suiteSetup(async function() {

      const coll = getColl();
      await coll.deleteMany({});
      const result = await coll.insertOne(issue1);
      this.idToDelete = result.insertedId.toString();
    });

    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      
			const validId = this.idToDelete;
			const deleteData = { _id: validId };
      
      chai
				.request(server)
				.delete(url)
				.send(deleteData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { result: 'successfully deleted', _id: validId });
					done();
				});
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      
			const invalidId = this.idToDelete;
			const deleteData = { _id: invalidId };
      
			chai
				.request(server)
				.delete(url)
				.send(deleteData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'could not delete', _id: invalidId });
					done();
				});
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      
			const deleteData = {};
      
			chai
				.request(server)
				.delete(url)
				.send(deleteData)
				.end(function (err, res) {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body, { error: 'missing _id' });
					done();
				});
    });
  });
  
});