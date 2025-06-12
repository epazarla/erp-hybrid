import React, { useState, useEffect, useCallback, useMemo, ChangeEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl, Grid, IconButton, InputAdornment, MenuItem, Paper, Select, SelectChangeEvent,
  Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, Tab, Tabs, TextField, Tooltip, Typography, Card, CardContent, CardHeader, Divider, Chip,
  Alert, AlertColor, Avatar, Switch, FormControlLabel, InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorOutlineIcon,
  HelpOutline as HelpOutlineIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  FilterList as FilterListIcon,
  Payment as PaymentIcon,
  Block as BlockIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';

// Types
type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'none';
type PaymentStatusFilter = PaymentStatus | 'all';

type DialogType = 'add' | 'edit' | 'delete' | 'payment' | null;

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  client: Client | null;
}

// Client service interface
interface IClientService {
  getClients(): Promise<Client[]>;
  createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client>;
  updateClient(id: string, client: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<Client | null>;
  deleteClient(id: string): Promise<void>;
  toggleClientStatus(id: string, isActive: boolean): Promise<Client | null>;
}

// ClientService implementation
const clientService: IClientService = {
  getClients: async (): Promise<Client[]> => {
    // Mock data
    return [];
  },
  
  createClient: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => ({
    ...client,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Client),
  
  updateClient: async (id: string, client: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<Client | null> => ({
    ...client,
    id,
    updated_at: new Date().toISOString()
  } as Client),
  
  deleteClient: async (id: string): Promise<void> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  
  toggleClientStatus: async (id: string, isActive: boolean): Promise<Client | null> => ({
    id,
    name: 'Mock Client',
    email: 'mock@example.com',
    phone: '',
    address: '',
    tax_id: '',
    sector: 'Diğer',
    is_active: isActive,
    payment_status: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Client)
};

interface ClientBase {
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  sector: string;
  is_active: boolean;
  payment_status: PaymentStatus;
  payment_method?: string;
  notes?: string;
  contact_person?: string;
  website?: string;
  monthly_income?: number;
  logo?: string;
}

interface Client extends ClientBase {
  id: string;
  created_at: string;
  updated_at?: string;
}

type ClientFormData = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const SECTORS = [
  'Teknoloji',
  'Sağlık',
  'Eğitim',
  'Finans',
  'Perakende',
  'Üretim',
  'Diğer'
] as const;

type Sector = typeof SECTORS[number];

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}



const ClientsPage: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  
  // Client data state
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<PaymentStatusFilter>('all');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToUpdatePayment, setClientToUpdatePayment] = useState<Client | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('none');
  
  // Form state - using newClient for both add and edit
  const [newClient, setNewClient] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    sector: 'Diğer',
    is_active: true,
    payment_status: 'none',
    payment_method: '',
    notes: '',
    contact_person: '',
    website: '',
    monthly_income: 0
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Apply filters to clients
  const applyFilters = useCallback((clients: Client[], query: string, sector: string, status: PaymentStatusFilter): Client[] => {
    return clients.filter(client => {
      const matchesSearch = !query || 
        client.name.toLowerCase().includes(query.toLowerCase()) ||
        client.email.toLowerCase().includes(query.toLowerCase()) ||
        (client.tax_id && client.tax_id.includes(query));
      
      const matchesSector = sector === 'all' || client.sector === sector;
      const matchesStatus = status === 'all' || client.payment_status === status;
      
      return matchesSearch && matchesSector && matchesStatus;
    });
  }, []);

  // Handle sector filter change
  const handleSectorChange = useCallback((event: SelectChangeEvent<string>) => {
    const sector = event.target.value;
    setFilterSector(sector);
    setPage(0);
    setFilteredClients(applyFilters(clients, searchQuery, sector, filterStatus));
  }, [clients, searchQuery, filterStatus, applyFilters]);
  
  // Current selection state
  // Not: Bu değişkenler dosyanın başında zaten tanımlanmış
  
  // UI state
  const [currentTab, setCurrentTab] = useState(0);
  const tabValue = currentTab; // tabValue ve currentTab aynı değişken
  
  // Dialog state management - legacy, using individual states now
  // const [dialogState, setDialogState] = useState<DialogState>({
  //   isOpen: false,
  //   type: null,
  //   client: null
  // });

  // Initialize form for new client
  const resetClientForm = useCallback((): Omit<Client, 'id' | 'created_at' | 'updated_at'> => ({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
    sector: 'Diğer',
    is_active: true,
    payment_status: 'none',
    payment_method: '',
    notes: ''
  }), []);
  
  // We're using newClient instead of clientForm for consistency
  // const [clientForm, setClientForm] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>(resetClientForm());
  
  // Handle payment status update
  const handleUpdatePaymentStatus = useCallback((client: Client) => {
    setClientToUpdatePayment(client);
    setNewPaymentStatus(client.payment_status);
    setPaymentDialogOpen(true);
  }, []);
  
  const confirmUpdatePaymentStatus = useCallback(async () => {
    if (!clientToUpdatePayment) return;
    
    try {
      // Burada gerçek API çağrısı yapılacak
      const updatedClient = { ...clientToUpdatePayment, payment_status: newPaymentStatus };
      
      const updatedClients = clients.map(c => 
        c.id === clientToUpdatePayment.id ? updatedClient : c
      );
      
      setClients(updatedClients);
      setFilteredClients(applyFilters(updatedClients, searchQuery, filterSector, filterStatus));
      setPaymentDialogOpen(false);
      setClientToUpdatePayment(null);
      
      setSnackbar({
        open: true,
        message: 'Tahsilat durumu başarıyla güncellendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Tahsilat durumu güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Tahsilat durumu güncellenirken bir hata oluştu',
        severity: 'error'
      });
    }
  }, [clientToUpdatePayment, newPaymentStatus, clients, searchQuery, filterSector, filterStatus, applyFilters]);
  
  const cancelUpdatePaymentStatus = useCallback(() => {
    setPaymentDialogOpen(false);
    setClientToUpdatePayment(null);
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

// Handle client form changes
  const handleNewClientChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setNewClient(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  // Handle status filter change
  const handleStatusChange = useCallback((event: SelectChangeEvent<string>) => {
    const status = event.target.value as PaymentStatusFilter;
    setFilterStatus(status);
    setPage(0);
    setFilteredClients(applyFilters(clients, searchQuery, filterSector, status));
  }, [clients, searchQuery, filterSector, applyFilters]);

  // Handle tab change
  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    // Map tab index to payment status filter
    let status: PaymentStatusFilter = 'all';
    switch (newValue) {
      case 0: status = 'all'; break;
      case 1: status = 'paid'; break;
      case 2: status = 'pending'; break;
      case 3: status = 'overdue'; break;
      default: status = 'all';
    }
    
    setFilterStatus(status);
    setFilteredClients(applyFilters(clients, searchQuery, filterSector, status));
  }, [clients, searchQuery, filterSector, applyFilters]);

  // Handle add client
  const handleAddClient = useCallback(async () => {
    try {
      const createdClient = await clientService.createClient(newClient);
      setClients(prev => [...prev, createdClient]);
      setFilteredClients(prev => [...prev, createdClient]);
      setAddDialogOpen(false);
      setNewClient(resetClientForm());
      
      setSnackbar({
        open: true,
        message: 'Müşteri başarıyla eklendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Müşteri eklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri eklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  }, [newClient, resetClientForm]);

  // Handle update client
  const handleUpdateClient = useCallback(async () => {
    if (!editingClient) return;
    
    try {
      const updatedClient = await clientService.updateClient(editingClient.id, newClient);
      
      if (updatedClient) {
        const updatedClients = clients.map(c => 
          c.id === editingClient.id ? updatedClient : c
        );
        
        setClients(updatedClients);
        setFilteredClients(applyFilters(updatedClients, searchQuery, filterSector, filterStatus));
        setEditDialogOpen(false);
        setEditingClient(null);
        
        setSnackbar({
          open: true,
          message: 'Müşteri bilgileri başarıyla güncellendi',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Müşteri güncellenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri güncellenirken bir hata oluştu',
        severity: 'error'
      });
    }
  }, [editingClient, newClient, clients, searchQuery, filterSector, filterStatus, applyFilters]);

  // Handle edit client button click
  const handleEditClient = useCallback((client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      tax_id: client.tax_id,
      sector: client.sector,
      is_active: client.is_active,
      payment_status: client.payment_status,
      payment_method: client.payment_method || '',
      notes: client.notes || '',
      contact_person: client.contact_person || '',
      website: client.website || '',
      monthly_income: client.monthly_income || 0
    });
    setEditDialogOpen(true);
  }, []);

  // Handle delete client
  const handleDeleteClient = useCallback(async () => {
    if (!clientToDelete) return;
    
    try {
      await clientService.deleteClient(clientToDelete.id);
      
      const updatedClients = clients.filter(c => c.id !== clientToDelete.id);
      setClients(updatedClients);
      setFilteredClients(applyFilters(updatedClients, searchQuery, filterSector, filterStatus));
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      
      setSnackbar({
        open: true,
        message: 'Müşteri başarıyla silindi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Müşteri silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri silinirken bir hata oluştu',
        severity: 'error'
      });
    }
  }, [clientToDelete, clients, searchQuery, filterSector, filterStatus, applyFilters]);

  // Handle delete client button click
  const handleConfirmDelete = useCallback((client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  }, []);

  // Handle close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);
  
  // Bu fonksiyonlar zaten yukarıda tanımlanmış

  // Memoize filtered clients
  const filteredClientsMemoized = useMemo(() => {
    return applyFilters(clients, searchQuery, filterSector, filterStatus);
  }, [clients, searchQuery, filterSector, filterStatus, applyFilters]);

  // Update filtered clients when filters change
  useEffect(() => {
    setFilteredClients(filteredClientsMemoized);
    setPage(0); // Reset to first page when filters change
  }, [filteredClientsMemoized]);

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const fetchedClients = await clientService.getClients();
        setClients(fetchedClients);
        setFilteredClients(applyFilters(fetchedClients, searchQuery, filterSector, filterStatus));
      } catch (error) {
        console.error('Müşteriler yüklenirken hata oluştu:', error);
        setSnackbar({
          open: true,
          message: 'Müşteriler yüklenirken bir hata oluştu',
          severity: 'error'
        });
      }
    };
    
    fetchClients();
  }, [searchQuery, filterSector, filterStatus, applyFilters]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" component="h1">
                  Müşteri Yönetimi
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setNewClient(resetClientForm());
                    setAddDialogOpen(true);
                  }}
                >
                  Yeni Müşteri Ekle
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Müşteri Ara"
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFilteredClients(applyFilters(clients, e.target.value, filterSector, filterStatus));
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="sector-filter-label">Sektör</InputLabel>
                  <Select
                    labelId="sector-filter-label"
                    value={filterSector}
                    onChange={handleSectorChange}
                    label="Sektör"
                  >
                    <MenuItem value="all">Tüm Sektörler</MenuItem>
                    {SECTORS.map((sector) => (
                      <MenuItem key={sector} value={sector}>
                        {sector}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
              <Tabs value={tabValue} onChange={handleChangeTab} aria-label="Tahsilat durumu filtreleri">
                <Tab label="Tümü" />
                <Tab label="Ödendi" />
                <Tab label="Beklemede" />
                <Tab label="Gecikmiş" />
              </Tabs>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Müşteri Adı</TableCell>
                  <TableCell>İletişim</TableCell>
                  <TableCell>Sektör</TableCell>
                  <TableCell>Tahsilat Durumu</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {client.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{client.name}</Typography>
                            {client.contact_person && (
                              <Typography variant="body2" color="text.secondary">
                                {client.contact_person}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.email}</Typography>
                        {client.phone && <Typography variant="body2">{client.phone}</Typography>}
                      </TableCell>
                      <TableCell>{client.sector}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            client.payment_status === 'paid' ? 'Ödendi' :
                            client.payment_status === 'pending' ? 'Beklemede' :
                            client.payment_status === 'overdue' ? 'Gecikmiş' :
                            client.payment_status === 'cancelled' ? 'İptal Edildi' : 'Belirlenmedi'
                          }
                          color={
                            client.payment_status === 'paid' ? 'success' :
                            client.payment_status === 'pending' ? 'warning' :
                            client.payment_status === 'overdue' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={client.is_active ? 'Aktif' : 'Pasif'}
                          color={client.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Düzenle">
                            <IconButton onClick={() => handleEditClient(client)} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tahsilat Durumu">
                            <IconButton onClick={() => handleUpdatePaymentStatus(client)} size="small">
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={client.is_active ? 'Pasif Yap' : 'Aktif Yap'}>
                            <IconButton
                              onClick={async () => {
                                try {
                                  const updatedClient = await clientService.toggleClientStatus(
                                    client.id,
                                    !client.is_active
                                  );
                                  
                                  if (updatedClient) {
                                    const updatedClients = clients.map(c => 
                                      c.id === client.id ? { ...c, is_active: !c.is_active } : c
                                    );
                                    
                                    setClients(updatedClients);
                                    setFilteredClients(applyFilters(updatedClients, searchQuery, filterSector, filterStatus));
                                    
                                    setSnackbar({
                                      open: true,
                                      message: `Müşteri ${!client.is_active ? 'aktif' : 'pasif'} duruma getirildi`,
                                      severity: 'success'
                                    });
                                  }
                                } catch (error) {
                                  console.error('Müşteri durumu güncellenirken hata oluştu:', error);
                                  setSnackbar({
                                    open: true,
                                    message: 'Müşteri durumu güncellenirken bir hata oluştu',
                                    severity: 'error'
                                  });
                                }
                              }}
                              size="small"
                            >
                              {client.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton onClick={() => handleConfirmDelete(client)} size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="subtitle1" sx={{ my: 5 }}>
                        Müşteri bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredClients.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Sayfa başına satır:"
            />
          </TableContainer>
        </Grid>
      </Grid>

      {/* Yeni Müşteri Ekleme Dialogu */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
  <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
  <DialogContent>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Müşteri Adı *"
          name="name"
          value={newClient.name}
          onChange={handleNewClientChange}
          margin="normal"
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Yetkili Kişi"
          name="contact_person"
          value={newClient.contact_person}
          onChange={handleNewClientChange}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="E-posta *"
          name="email"
          type="email"
          value={newClient.email}
          onChange={handleNewClientChange}
          margin="normal"
          required
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Telefon"
          name="phone"
          value={newClient.phone}
          onChange={handleNewClientChange}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Adres"
          name="address"
          value={newClient.address}
          onChange={handleNewClientChange}
          margin="normal"
          multiline
          rows={2}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Sektör"
          name="sector"
          value={newClient.sector}
          onChange={handleNewClientChange}
          margin="normal"
        >
          {SECTORS.map((sector) => (
            <MenuItem key={sector} value={sector}>
              {sector}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Vergi Numarası"
          name="tax_id"
          value={newClient.tax_id}
          onChange={handleNewClientChange}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Web Sitesi"
          name="website"
          value={newClient.website}
          onChange={handleNewClientChange}
          margin="normal"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Aylık Gelir (TL)"
          name="monthly_income"
          type="number"
          value={newClient.monthly_income}
          onChange={handleNewClientChange}
          margin="normal"
          InputProps={{
            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Notlar"
          name="notes"
          value={newClient.notes}
          onChange={handleNewClientChange}
          margin="normal"
          multiline
          rows={3}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={newClient.is_active}
              onChange={(e) => setNewClient({ ...newClient, is_active: e.target.checked })}
              name="is_active"
              color="primary"
            />
          }
          label={newClient.is_active ? 'Aktif Müşteri' : 'Pasif Müşteri'}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setAddDialogOpen(false)} color="inherit">
      İptal
    </Button>
    <Button 
      onClick={handleAddClient} 
      color="primary" 
      variant="contained"
      disabled={!newClient.name || !newClient.email}
    >
      Müşteri Ekle
    </Button>
  </DialogActions>
</Dialog>

      {/* Müşteri Düzenleme Diyaloğu */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Müşteri Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Müşteri Adı *"
                name="name"
                value={newClient.name}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yetkili Kişi"
                name="contact_person"
                value={newClient.contact_person}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="E-posta *"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleNewClientChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={newClient.phone}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adres"
                name="address"
                value={newClient.address}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Sektör"
                name="sector"
                value={newClient.sector}
                onChange={handleNewClientChange}
                margin="normal"
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vergi Numarası"
                name="tax_id"
                value={newClient.tax_id}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Web Sitesi"
                name="website"
                value={newClient.website}
                onChange={handleNewClientChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Aylık Gelir (TL)"
                name="monthly_income"
                type="number"
                value={newClient.monthly_income}
                onChange={handleNewClientChange}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notlar"
                name="notes"
                value={newClient.notes}
                onChange={handleNewClientChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newClient.is_active}
                    onChange={(e) => setNewClient({ ...newClient, is_active: e.target.checked })}
                    name="is_active"
                    color="primary"
                  />
                }
                label={newClient.is_active ? 'Aktif Müşteri' : 'Pasif Müşteri'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tahsilat Durumu</InputLabel>
                <Select
                  value={newClient.payment_status}
                  onChange={(e) => setNewClient({ ...newClient, payment_status: e.target.value as PaymentStatus })}
                  label="Tahsilat Durumu"
                >
                  <MenuItem value="none">Beklemede</MenuItem>
                  <MenuItem value="partial">Kısmi Ödendi</MenuItem>
                  <MenuItem value="paid">Ödendi</MenuItem>
                  <MenuItem value="overdue">Gecikmiş</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button 
            onClick={handleUpdateClient} 
            color="primary" 
            variant="contained"
            disabled={!newClient.name || !newClient.email}
          >
            Değişiklikleri Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tahsilat Durumu Güncelleme Diyaloğu */}
      <Dialog
        open={paymentDialogOpen}
        onClose={cancelUpdatePaymentStatus}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tahsilat Durumunu Güncelle</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Tahsilat Durumu</InputLabel>
            <Select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
              label="Tahsilat Durumu"
            >
              <MenuItem value="none">Belirlenmedi</MenuItem>
              <MenuItem value="pending">Beklemede</MenuItem>
              <MenuItem value="paid">Ödendi</MenuItem>
              <MenuItem value="overdue">Gecikmiş</MenuItem>
              <MenuItem value="cancelled">İptal Edildi</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUpdatePaymentStatus} color="inherit">
            İptal
          </Button>
          <Button onClick={confirmUpdatePaymentStatus} color="primary" variant="contained">
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Müşteri Silme Onay Diyaloğu */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Müşteriyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {clientToDelete && (
              <>
                <strong>{clientToDelete.name}</strong> adlı müşteriyi silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            İptal
          </Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientsPage;
