import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  TextField, 
  MenuItem, 
  InputAdornment,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { 
  Client, 
  SECTORS,
  CLIENTS_UPDATED_EVENT
} from '../services/ClientService';

import {
  getAllClients,
  uploadDemoClients
} from '../services/ApiClientService';

const ClientsPage: React.FC = () => {
  // State tanımlamaları
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [tabValue, setTabValue] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'info'}>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });

  // Müşterileri yükle
  useEffect(() => {
    loadClients();
    
    // Müşteri güncellemelerini dinle
    const handleClientsUpdated = () => {
      console.log('Müşteriler güncellendi, yeniden yükleniyor...');
      loadClients();
    };

    window.addEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
    
    return () => {
      window.removeEventListener(CLIENTS_UPDATED_EVENT, handleClientsUpdated);
    };
  }, []);

  // Müşterileri yükle
  const loadClients = async () => {
    try {
      const allClients = await getAllClients();
      setClients(allClients);
      applyFilters(searchQuery, filterSector, filterStatus);
      console.log(`${allClients.length} müşteri yüklendi`);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteriler yüklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  // Örnek müşteri verilerini geri yükle
  const restoreClientData = async () => {
    try {
      await uploadDemoClients();
      await loadClients();
      setSnackbar({
        open: true,
        message: 'Örnek müşteri verileri başarıyla yüklendi.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Müşteri verileri geri yüklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Müşteri verileri geri yüklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  // Filtreleri uygula
  const applyFilters = (query: string, sector: string, status: string) => {
    let filtered = [...clients];
    
    // Arama sorgusu filtresi
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchLower) ||
        client.contactPerson.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.address.toLowerCase().includes(searchLower) ||
        client.sector.toLowerCase().includes(searchLower)
      );
    }
    
    // Sektör filtresi
    if (sector && sector !== 'all') {
      filtered = filtered.filter(client => client.sector === sector);
    }
    
    // Durum filtresi
    if (status === 'active') {
      filtered = filtered.filter(client => client.isActive);
    } else if (status === 'inactive') {
      filtered = filtered.filter(client => !client.isActive);
    }
    
    setFilteredClients(filtered);
    setPage(0); // Filtre değiştiğinde ilk sayfaya dön
  };

  // Sayfa değişimi
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Sayfa başına satır sayısı değişimi
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tab değişimi
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Tab değiştiğinde filtreleri güncelle
    if (newValue === 0) {
      setFilterStatus('all');
    } else if (newValue === 1) {
      setFilterStatus('active');
    } else if (newValue === 2) {
      setFilterStatus('inactive');
    }
    
    applyFilters(searchQuery, filterSector, 
      newValue === 0 ? 'all' : newValue === 1 ? 'active' : 'inactive'
    );
  };

  // Arama sorgusu değişimi
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(query, filterSector, filterStatus);
  };

  // Sektör filtresi değişimi
  const handleSectorFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sector = e.target.value;
    setFilterSector(sector);
    applyFilters(searchQuery, sector, filterStatus);
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Müşteri Yönetimi
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3, p: 2 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Müşteri Listesi
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={restoreClientData}
            startIcon={<AddIcon />}
          >
            Örnek Verileri Yükle
          </Button>
        </Box>
        
        {/* Arama ve Filtre */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Müşteri Ara"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              placeholder="İsim, e-posta, telefon veya adres ile ara..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Sektöre Göre Filtrele"
              variant="outlined"
              value={filterSector}
              onChange={handleSectorFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                )
              }}
            >
              <MenuItem value="all">Tüm Sektörler</MenuItem>
              {SECTORS.map(sector => (
                <MenuItem key={sector} value={sector}>{sector}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label={`Tüm Müşteriler (${clients.length})`} />
          <Tab label={`Aktif Müşteriler (${clients.filter(c => c.isActive).length})`} />
          <Tab label={`Pasif Müşteriler (${clients.filter(c => !c.isActive).length})`} />
        </Tabs>
        
        {/* Müşteri Tablosu */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Firma Adı</TableCell>
                <TableCell>İlgili Kişi</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Sektör</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>Kayıt Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={client.logo || undefined} 
                            sx={{ mr: 2, bgcolor: client.isActive ? 'primary.main' : 'grey.500' }}
                          >
                            {client.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body1">{client.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Chip 
                          label={client.sector} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={client.isActive ? 'Aktif' : 'Pasif'} 
                          size="small" 
                          color={client.isActive ? 'success' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      {clients.length === 0 ? 
                        'Henüz müşteri kaydı bulunmuyor. Yeni müşteri ekleyin.' : 
                        'Arama kriterlerine uygun müşteri bulunamadı.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredClients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>
      
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
