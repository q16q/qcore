from datetime import datetime
from birthdays import Birthdays
import requests, time

print('[python job] birthdayRemider running')

birthdays = Birthdays().birthdays

while True:
	now = datetime.now()
	for key, date in birthdays.items():
		if date.day == now.day and date.month == now.month:
			requests.post('https://discord.com/api/webhooks/1097616589983064125/sHnAP-tbc4-s8KxYa3W9_MZBU_MSmlSUo7yaYaKjcWxcA1o4jnb5T5rMQB0v4oZ3ZvwG', {"content": "<@437550751330598915> у %s др" % key})
			time.sleep((60 * 60 * 24) - 60)
	time.sleep(60)