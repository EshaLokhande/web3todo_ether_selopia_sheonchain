import { ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Task = ({ task, onDelete }) => {
  return (
    <ListItem className="!bg-blue-50 !rounded-lg !mb-2 !transition-all hover:!shadow-md">
      <ListItemText
        primary={task.taskText}
        primaryTypographyProps={{ className: 'text-gray-800' }}
      />
      <IconButton
        onClick={onDelete}
        className="!text-red-500 hover:!bg-red-50"
        title="Delete task"
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
};

export default Task;