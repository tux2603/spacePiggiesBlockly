for i in range(0, 1000):
	star_x = randint(1, 1022)
	star_y = randint(1, 1022)
	star_color = star_colors[randint(0, 4)]
	star_size = randint(0, 3)
	if star_size == 0:
		pixels[star_x, star_y] = star_color
	elif star_size == 1:
		pixels[star_x, star_y] = star_color
		pixels[star_x + 1, star_y] = star_color
		pixels[star_x, star_y + 1] = star_color
		pixels[star_x + 1, star_y + 1] = star_color
	else:
		pixels[star_x - 1, star_y] = star_color
		pixels[star_x, star_y-1] = star_color
		pixels[star_x, star_y] = star_color
		pixels[star_x+1, star_y] = star_color
		pixels[star_x, star_y+1] = star_color
