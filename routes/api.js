'use strict';
const { ObjectId } = require('mongodb');
const { getColl } = require('../connection');


module.exports = function(app) {


  app.route('/api/issues/:project')

    .get(async function(req, res) {

      const filter = { project: req.params.project };

      for (let prop of Object.keys(req.query)) {

        if (!req.query[prop]) {
          continue;
        }

        if (prop === 'open') {
          if (req.query.open === 'true') {
            filter.open = true;
          }
          else if (req.query.open === 'false') {
            filter.open = false;
          }
          else {
            filter.open = req.query.open;
          }
        }
        else if (prop === 'created_on' || prop === 'updated_on') {
          filter[prop] = new Date(req.query[prop]);
        }
        else if (prop === '_id') {
          filter[prop] = new ObjectId(req.query[prop]);
        }
        else {
          filter[prop] = req.query[prop];
        }
      }

      //console.log('### FILTER ###:', filter)

      let crsr;
      const projection = { project: 0 };

      try {
        const coll = getColl();
        crsr = coll.find(filter).project(projection);
        const data = await crsr.toArray();
        //console.log('### DATA ###:', data);
        res.send(data);
      }
      catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
      finally {
        if (crsr) {
          await crsr.close();
        }
      }
    })
    .post(async function(req, res) {

      if (req.body.issue_title && req.body.issue_text && req.body.created_by) {

        const issue = {
          project: req.params.project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        };

        try {
          const coll = getColl();
          await coll.insertOne(issue);
          const { project, ...respObj } = issue;
          res.send(respObj);
        }
        catch (err) {
          console.error(err);
          res.status(500).send(err);
        }
      }
      else {
        res.send({ error: 'required field(s) missing' });
      }
    })
    .put(async function(req, res) {

      const filter = { project: req.params.project };

      if (!req.body._id) {
        res.send({ error: 'missing _id' });
        return;
      }

      const id = req.body._id;

      if (!ObjectId.isValid(id)) {
        res.send({ error: 'could not update', _id: id });
        return;
      }

      const updateObj = {};

      for (let prop of Object.keys(req.body)) {
        if (prop == '_id') {
          continue;
        }
        if (prop == 'open') {
          updateObj.open = false;
        }
        else if (req.body[prop]) {
          updateObj[prop] = req.body[prop];
        }
      }

      if (Object.keys(updateObj).length > 0) {
        updateObj.updated_on = new Date();
      }
      else {
        res.send({ error: 'no update field(s) sent', _id: id });
        return;
      }

      filter._id = new ObjectId(id);
      const update = { $set: updateObj };

      try {
        const coll = getColl();
        const result = await coll.updateOne(filter, update);
        if (result.modifiedCount == 1) {
          res.send({ result: 'successfully updated', _id: id });
        }
        else {
          res.send({ error: 'could not update', _id: id });
        }
      }
      catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    })
    
    .delete(async function(req, res) {

      const filter = { project: req.params.project };
      const id = req.body._id;

      if (id) {

        if (!ObjectId.isValid(id)) {
          res.send({ error: 'could not delete', _id: id });
          return;
        }

        filter._id = new ObjectId(id);

        try {
          const coll = getColl();
          const result = await coll.deleteOne(filter);
          const obj = { _id: filter._id };

          if (result.deletedCount === 1) {
            obj.result = 'successfully deleted';
          }
          else {
            obj.error = 'could not delete';
          }

          res.send(obj);
        }
        catch (err) {
          console.error(err);
          res.status(500).send(err);
        }
      }
      else {
        res.send({ error: 'missing _id' });
      }
    });

};