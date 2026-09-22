const express = require("express");
const prisma = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = [
  "Todo",
  "In Progress",
  "Done",
];

router.get("/:projectId", auth, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});

router.post("/:projectId", auth, async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { title } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.userId,
      },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        projectId,
        userId: req.userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, status } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    if (
      title !== undefined &&
      !title.trim()
    ) {
      return res.status(400).json({
        message: "Task title cannot be empty",
      });
    }

    const updatedTask =
      await prisma.task.update({
        where: {
          id,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),
          ...(status !== undefined && {
            status,
          }),
        },
      });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Task deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});

module.exports = router;