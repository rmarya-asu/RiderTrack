var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

var auth = require('../config/auth');

var User = require('../models/rider');
var Activity = require('../models/activity');
var Events = require('../models/events');

var cache = require('../config/cache');
var CACHE_MAX = 3;

router.get('/test', auth.required, function(req, res, next) {
  // User.findById(req.payload.id).then(function(user) {
  //   if (!user) {
  //     return res.sendStatus(401);
  //   }
  //   //user.id -> user id
  //   //next query the userEvents and return all the past gps data for a run.
  //   //res.send({id: user.id});
  //   res.json(req.payload);
  //
  // });
    res.json(req.payload);
})


router.post('/',auth.required,function(req,res,next){
    var appuser;
    var now = Date.now();
    var event_id = new mongoose.Types.ObjectId(req.body.eventid);
    console.log(typeof event_id);
    console.log(event_id);
    console.log('POST /savemyloc call recieved at :' + now);
    if(!req.body){
      res.render('error',{message:'invalid body'});
    }
    else if(!req.body.lat || !req.body.lng || !req.body.eventid){
      res.render('error',{message:'invalid lat/lng'});
    }
    else if(req.body.lat === "" || req.body.lng === "" || req.body.eventid === "" ){
      res.render('error',{message:'empty lat,lng or eventid'});
    }
    else{
        Activity.findOne({eventid:event_id},function(err,activity){
          if(err){res.render('error',{message:err});}
          //1. user activity does not exist.
          var user_gps_data = {
            timestamp: Date.now(),
            lat: req.body.lat,
            long: req.body.lng,
            speed: 0,
            distLeft: 123,
            altitude: 234
          };
          if(activity === null){ //db returns null when it doesnt find any data.
            console.log('activity is null');
            //1.1create a new activity and store the data.
            //TODO: this is the first time the user has hit the start button and started braodcasting.
            //figure out pre processing thats required - based on time.
                var user_activiy = new Activity({
                  eventid: req.body.eventid,
                  riderid: req.payload.id,
                  lastestcoordinates:{
                    lat: req.body.lat,
                    long: req.body.lng
                  },
                  gps_stats:[user_gps_data],
                  currentRace:null
                });
                // console.log('user activity - '+ user_activiy);
                //console.log('user_gps data - ' + user_gps_data);
                user_activiy.save(function(err,result){
                  if(err){res.render('error',{message:err});}
                  return res.send({result:"OK",data:result})
                });
          }
          else{
            //activity already exists.
            console.log('activity already exists ',activity);
            cache.get(req.payload.id,function(err,athlete_gps_data){
              if(athlete_gps_data !== null){
                console.log('cache hit!!');
                //gps data found in cache ->
                //TODO: what should be returned ??
                var ath_gps_cache = JSON.parse(athlete_gps_data);
                if(ath_gps_cache.length < CACHE_MAX){
                  ath_gps_cache.push(user_gps_data);
                  cache.set(req.payload.id,JSON.stringify(ath_gps_cache),function(){
                    //res.json(ath_gps);
                    console.log('cache set updated - length is lesser than 3');
                    return res.send({result:"OK",data:ath_gps_cache})
                  })
                }
                else{
                  console.log('items in cache exceeds max ammount - 3');
                  ath_gps_cache.push(user_gps_data);
                  activity.set({gps_stats:ath_gps_cache});
                  cache.del(req.payload.id); //delete cache data -> we are storing it to db
                  activity.save(function (err, updatedData) {
                        if (err) return res.render('error',{message:err});
                        console.log('updatedData -' + updatedData);
                          return res.send({result:"OK",status:"saved to db",data:activity})
                          })
                      }
              }else{
                //data not found in cache but useractivity exists.
                console.log('data not found in cache, but activity log for event exists in activities collection');
                //var gps_data = activity.gps_stats;
                if(activity.gps_stats.length < CACHE_MAX){
                activity.gps_stats.push(user_gps_data);
                }
                else{
                  activity.gps_stats =[];
                  activity.gps_stats.push(user_gps_data);
                }
                // gps_data.push(user_gps_data);
                cache.set(req.payload.id,JSON.stringify(activity.gps_stats),function(){
                  //cache has been set
                  console.log('cache set ');
                  res.json(activity); //response data sent back
                })
              }
            })
          }//end of else
        })
      }
})

module.exports = router;
