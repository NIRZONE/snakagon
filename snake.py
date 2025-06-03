import random
from js import document

canvas = document.querySelector("#game")
ctx = canvas.getContext("2d")
block_size = 20
width, height = 400, 400

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Snake:
    def __init__(self):
        self.body = [Point(5, 10), Point(4, 10), Point(3, 10)]
        self.direction = "RIGHT"
        self.grow = False

    def move(self):
        head = self.body[0]
        dx, dy = 0, 0
        if self.direction == "RIGHT": dx = 1
        elif self.direction == "LEFT": dx = -1
        elif self.direction == "UP": dy = -1
        elif self.direction == "DOWN": dy = 1
        new_head = Point(head.x + dx, head.y + dy)
        self.body.insert(0, new_head)
        if not self.grow:
            self.body.pop()
        else:
            self.grow = False

    def change_direction(self, dir):
        opposites = {"LEFT": "RIGHT", "RIGHT": "LEFT", "UP": "DOWN", "DOWN": "UP"}
        if dir != opposites.get(self.direction):
            self.direction = dir

    def eats(self, food):
        return self.body[0].x == food.x and self.body[0].y == food.y

    def collision(self):
        head = self.body[0]
        if head.x < 0 or head.x >= width // block_size or head.y < 0 or head.y >= height // block_size:
            return True
        for part in self.body[1:]:
            if head.x == part.x and head.y == part.y:
                return True
        return False

class Food:
    def __init__(self, snake):
        self.x, self.y = self.random_pos(snake)

    def random_pos(self, snake):
        while True:
            x = random.randint(0, (width // block_size) - 1)
            y = random.randint(0, (height // block_size) - 1)
            if all(seg.x != x or seg.y != y for seg in snake.body):
                return x, y

def draw_rect(x, y, color):
    ctx.fillStyle = color
    ctx.fillRect(x * block_size, y * block_size, block_size, block_size)

def draw(snake, food):
    ctx.fillStyle = "#222"
    ctx.fillRect(0, 0, width, height)
    for i, seg in enumerate(snake.body):
        color = "#6aff6a" if i == 0 else "#44cc44"
        draw_rect(seg.x, seg.y, color)
    draw_rect(food.x, food.y, "#ff5252")

snake = Snake()
food = Food(snake)
score = 0
running = True

def game_loop(*args):
    global running, score, food
    if not running:
        ctx.font = "40px sans-serif"
        ctx.fillStyle = "#fff"
        ctx.fillText("Game Over!", 100, 200)
        ctx.font = "20px sans-serif"
        ctx.fillText(f"Score: {score}", 160, 240)
        return
    snake.move()
    if snake.eats(food):
        snake.grow = True
        score += 1
        food = Food(snake)
    if snake.collision():
        running = False
    draw(snake, food)
    ctx.font = "16px sans-serif"
    ctx.fillStyle = "#fff"
    ctx.fillText(f"Score: {score}", 10, 20)
    window.setTimeout(game_loop, 100)

def on_key(event):
    code = event.code
    if code == "ArrowUp": snake.change_direction("UP")
    elif code == "ArrowDown": snake.change_direction("DOWN")
    elif code == "ArrowLeft": snake.change_direction("LEFT")
    elif code == "ArrowRight": snake.change_direction("RIGHT")

from js import window
document.addEventListener("keydown", on_key)
game_loop()