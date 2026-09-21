<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Task::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $task = Task::create($this->validatedData($request));

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $task->update($this->validatedData($request, true));

        return response()->json($task->fresh());
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(null, 204);
    }

    private function validatedData(Request $request, bool $partial = false): array
    {
        $rules = [
            'task_name' => [$partial ? 'sometimes' : 'required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:240'],
            'due_date' => ['nullable', 'date'],
            'status' => [$partial ? 'sometimes' : 'nullable', 'in:Pending,Completed'],
        ];

        $data = $request->validate($rules);
        $data['status'] ??= 'Pending';

        return $data;
    }
}