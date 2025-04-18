import React from 'react';
import { Box, Paper, Typography, Grid, LinearProgress, Chip, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CheckCircleOutline as CompletedIcon,
  Timer as PendingIcon,
  Layers as TotalIcon,
  Schedule as UpcomingIcon,
} from '@mui/icons-material';

// Tipi di dati
interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  dueToday: number;
}

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
}

interface DashboardStatsProps {
  taskStats: TaskStats;
  projectStats: ProjectStats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ taskStats, projectStats }) => {
  // Calcolo delle percentuali
  const completionPercentage = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100) 
    : 0;
  
  // Dati per il grafico a torta dei task
  const taskStatusData = [
    { name: 'Completati', value: taskStats.completed, color: '#4caf50' },
    { name: 'In corso', value: taskStats.inProgress, color: '#2196f3' },
    { name: 'In attesa', value: taskStats.pending, color: '#ff9800' }
  ];

  return (
    <Grid container spacing={3}>
      {/* Grafico di completamento task */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Avanzamento Task
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              Completamento
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {`${completionPercentage}%`}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ height: 8, borderRadius: 4, mb: 3 }} 
          />

          {/* Distribuzione task per stato */}
          <Box sx={{ height: 200, mt: 3 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} task`, 'Quantità']} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      {/* Statistiche numeriche */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Riepilogo Attività
          </Typography>
          
          {/* Task stats */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <TotalIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">Task Totali:</Typography>
              <Typography variant="h6" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                {taskStats.total}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CompletedIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body1">Task Completati:</Typography>
              <Typography variant="h6" sx={{ ml: 'auto', color: 'success.main', fontWeight: 'medium' }}>
                {taskStats.completed}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <UpcomingIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="body1">In Scadenza Oggi:</Typography>
              <Chip 
                label={taskStats.dueToday} 
                color={taskStats.dueToday > 0 ? 'warning' : 'default'} 
                size="small" 
                sx={{ ml: 'auto' }} 
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          {/* Projects stats */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" fontWeight="medium" gutterBottom>
              Progetti
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <TotalIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">Totali:</Typography>
              <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'medium' }}>
                {projectStats.total}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <PendingIcon sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="body2">Attivi:</Typography>
              <Typography variant="body1" sx={{ ml: 'auto', color: 'info.main', fontWeight: 'medium' }}>
                {projectStats.active}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CompletedIcon sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="body2">Completati:</Typography>
              <Typography variant="body1" sx={{ ml: 'auto', color: 'success.main', fontWeight: 'medium' }}>
                {projectStats.completed}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;