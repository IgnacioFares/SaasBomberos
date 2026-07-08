import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import type { LoginRequest } from '../types'

interface Props {
  onLogin: (credenciales: LoginRequest) => void
  loading: boolean
  error: string | null
}

const LoginForm = ({ onLogin, loading, error }: Props) => {
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' })
  const [verPassword, setVerPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(form)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        name="email"
        type="email"
        label="Email"
        placeholder="nombre@cuartel.com"
        value={form.email}
        onChange={handleChange}
        required
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        name="password"
        type={verPassword ? 'text' : 'password'}
        label="Contraseña"
        placeholder="••••••••"
        value={form.password}
        onChange={handleChange}
        required
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setVerPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verPassword ? (
                    <VisibilityOffRoundedIcon fontSize="small" />
                  ) : (
                    <VisibilityRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {error && (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        disabled={loading}
        fullWidth
        className="mt-2! py-2.5!"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </Box>
  )
}

export default LoginForm
