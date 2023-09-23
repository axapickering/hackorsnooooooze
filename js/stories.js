"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  $navUserFunctions.hide();

  putStoriesOnPage(storyList.stories);
}

function generateFavoriteIconMarkup(story) {
  let favoriteIconMarkup = '<i class="favorite-icon bi bi-star';
  if (currentUser) {

    favoriteIconMarkup += (Story.isFavorite(story.storyId))
      ?
      '-fill">' :
      '">';

  } else {

    favoriteIconMarkup += ' hidden">';

  }
  return favoriteIconMarkup;
}



/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
   console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const favoriteMarkup = generateFavoriteIconMarkup(story);

  return $(`
      <li id="${story.storyId}">

        ${favoriteMarkup}</i>

        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Given an array of stories, generates their HTML, and puts on page. */

function putStoriesOnPage(stories) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets the data from the form, adds the story to storyList and the DOM. */
async function addStoryAndUpdatePage(evt) {
  evt.preventDefault();

  const author = $("#story-author-input").val();
  const title = $("#story-title-input").val();
  const url = $("#story-url-input").val();

  const newStory = await storyList.addStory(currentUser, { title, author, url });
  $allStoriesList.prepend(generateStoryMarkup(newStory));
  currentUser.ownStories.unshift(newStory);

  $submitStoryForm.get(0).reset();
  $submitStoryFormContainer.hide();

  putStoriesOnPage(storyList.stories);
}

$submitStoryForm.on("submit", addStoryAndUpdatePage);

/** Handles favorite icon click by adding or removing the story from the
 * user's favorites
 */

async function handleFavoriteIconClick(evt) {

  const $story = $(evt.target).closest('li');
  const storyId = $story.attr('id');
  const isFavorite = $(evt.target).hasClass("bi-star-fill");

  // Get story by story ID
  const story = await Story.getStory(storyId);

  if (isFavorite) {
    await currentUser.removeFavorite(story);
  } else {
    await currentUser.addFavorite(story);
  }

  // Toggle the icon fill.
  $(evt.target).toggleClass('bi-star');
  $(evt.target).toggleClass('bi-star-fill');
}

$allStoriesList.on('click', '.favorite-icon', handleFavoriteIconClick);

function addDeleteIconsToStories() {
  $('li').prepend('<i class="bi bi-trash trash-icon"></i>');
}

async function handleDeleteIconClick(evt) {
  const $story = $(evt.target).closest('li');
  const storyId = $story.attr('id');
  console.debug(storyId);
  Story.deleteStory(storyId);
}

$allStoriesList.on('click', '.trash-icon', handleDeleteIconClick);
