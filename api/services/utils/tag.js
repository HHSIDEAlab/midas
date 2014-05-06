/**
 * Gets all the tags given a particular
 * where clause, allowing flexibly fetching
 * tags for different parts of the application,
 * such as projects, tasks, or people.
 *
 * Example: commentAssemble({ projectId: id }, function (err, comments) { });
 */

var _ = require('underscore');
var async = require('async');

var tagAssemble = function (where, done) {
  Tag.find()
  .where(where)
  .exec(function (err, tags) {
    if (err) { return done(err, null); }
    if (!tags || (tags.length == 0)) { return done(null, []); }
    var entities = {};
    var tagIds = [];

    // Helper function for async to look up each tag entitiy
    var getTags = function (tagId, next) {
      if (entities[tagId]) { return next(); }
      TagEntity.findOne(tagId, function (err, t) {
        entities[tagId] = t;
        next(err);
      });
    }

    // Get all the tag ids
    for (var i = 0; i < tags.length; i++) {
      tagIds.push(tags[i].tagId);
    }

    // Get the tag entities for each id
    async.each(tagIds, getTags, function(err) {
      if (err) { return done(err, null); }
      // Attach the tag entity to the tag
      for (var i = 0; i < tags.length; i++) {
        tags[i].tag = entities[tags[i].tagId];
      }
      return done(null, tags);
    });
  });
};

/**
 * Given a userId and a list of tags with types,
 * find and return the tag, or create the tag and
 * tag entity if it doesn't exist.
 *
 * @param userId the user associated
 * @param tags are in an object of the form:
 *        { type: [v1, v2, v3],
 *          type2: [v4] }
 * @param done the callback function in the form
 *        done(err, tags)
 */
var findOrCreateTags = function (userId, tags, done) {
  var resultTags = [];
  // tags are in an object of the form:
  // { type: [v1, v2, v3],
  //   type2: [v4] }
  // Process the types first, and then each tag name
  var processType = function (type, cbType) {
    // process a particular tag name of a given type
    var processTag = function (tagname, cbTag) {
      TagEntity.findOne()
      .where({ type: type.toLowerCase().trim() })
      .where({ name: tagname.toLowerCase().trim() })
      .exec(function (err, t) {
        if (err) { return cbTag(err); }
        // if the tag entity doesn't exist, create it
        if (!t) {
          // if the configuration prevents missing tags
          // from being created, abort
          if (sails.config.tags.createMissingTags !== true) {
            return cbTag();
          }
          // Otherwise continue and create the tag entity
          var tagEntity = {
            type: type.trim(),
            name: tagname.trim()
          };
          // The entity doesn't exist, so create it.
          TagEntity.create(tagEntity, function (err, t) {
            if (err) { return cbTag(err); }
            var tagObj = {
              userId: userId,
              tagId: t.id
            };
            // create tag association
            Tag.create(tagObj, function (err, newTag) {
              if (err) { return cbTag(err); }
              resultTags.push(newTag);
              cbTag();
            });
          });
        }
        // tag entity exists, create a tag association
        else {
          var tag = {
            userId: userId,
            tagId: t.id
          };
          // find or create the tag.  If it already exists,
          // don't want to create a duplicate.
          Tag.findOrCreate(tag, tag, function (err, newTag) {
            if (err) { return cbTag(err); }
            resultTags.push(newTag);
            cbTag();
          });
        }
      });
    };
    // process each of the tags of this type
    // must be run synchronously to prevent DB race conditions
    async.eachSeries(tags[type], processTag, cbType);
  };

  // begin processing each tag type
  async.each(_.keys(tags), processType, function (err) {
    if (err) { return done(err, null); }
    return done(null, resultTags);
  });
};

/**
 * Given a userId and a list of tagIds that are valid,
 * prune all tagIds that don't match the list given.
 *
 * @param userId of the user associated
 * @param tagIds array of ids of the Tag model that are valid
 * @param done callback of the form done(err, deletedTags)
 */
var pruneTags = function (userId, tagIds, done) {
  // find all of the tags that don't match the current tag ids
  Tag.find()
  .where({ userId: userId })
  .exec(function (err, tags) {
    if (err) { return done(err, null); }
    // given a tag, destroy it and call back
    var destroyTag = function (tag, cb) {
      // if the tagId is safe, don't destroy
      if (_.contains(tagIds, tag.id)) {
        return cb(null);
      }
      // the tagId wasn't found, destroy it
      tag.destroy(cb);
    };
    // destroy tags
    async.each(tags, destroyTag, function (err) {
      // return list of destroyed tags
      return done(err, tags);
    });
  });
};

module.exports = {
  assemble: tagAssemble,
  findOrCreateTags: findOrCreateTags,
  pruneTags: pruneTags
};
