import requests
import re
import time

def extract_link_post(link, max_retries=100, delay_seconds=0.001):
    try:
        # Extract post ID from the Reddit link
        post_id = extract_post_id_from_link(link)

        # Reddit API endpoint for getting post details
        api_link = f'https://www.reddit.com/api/info.json?id=t3_{post_id}'

        for attempt in range(max_retries):
            # Fetch data from the Reddit API
            response = requests.get(api_link)

            if response.ok:
                data = response.json()

                if data and 'data' in data and 'children' in data['data'] and len(data['data']['children']) > 0:
                    post = data['data']['children'][0]['data']
                    return {
                        'postTitle': post['title'],
                        'postContent': post['selftext'],
                    }
                else:
                    raise Exception('Invalid Reddit post link or no data received.')
            elif response.status_code == 429:
                # Retry after a delay if rate-limited
                print(f"Rate limited. Retrying after {delay_seconds} seconds...")
                time.sleep(delay_seconds)
            else:
                raise Exception(f"Failed to fetch post details. Status: {response.status_code}")

        raise Exception(f"Reached maximum retry attempts. Unable to fetch post details.")

    except Exception as error:
        raise Exception(f"Error: {str(error)}")

# Helper function to extract post ID from Reddit link
def extract_post_id_from_link(link):
    match = re.search(r'/comments/([a-z0-9]+)/', link)
    return match.group(1) if match else None

# if __name__ == "__main__":
#     # Replace 'https://www.reddit.com/r/your_subreddit/comments/your_post_id/' with the actual Reddit post link
#     reddit_post_link = 'https://www.reddit.com/r/OffMyChestPH/comments/17hxbkl/tangina_ng_mga_taong_binubully_si_tali_sotto/'

#     extracted_post = extract_link_post(reddit_post_link)

#     if extracted_post:
#         print("Extracted Post Details:")
#         print(extracted_post)
#     else:
#         print("Failed to extract post details.")
