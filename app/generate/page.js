'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CardActionArea,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardContent,

} from '@mui/material'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, collection, getDocs, getDoc, writeBatch, } from 'firebase/firestore'
import { db } from '@/firebase'

export default function Generate() {
    const {isLoaded , isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [text, setText] = useState('')
    const [setName, setSetName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams()
    const search = searchParams.get('id')


    const handleSubmit = async () => {
        if (!text.trim()) {
            alert('Please enter some text to generate flashcards.');
            return;
        }
    
        setLoading(true); // Set loading to true before starting the async operation
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error('Failed to generate flashcards');
            }
    
            const data = await response.json();
            setFlashcards(data);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            alert('An error occurred while generating flashcards. Please try again.');
        } finally {
            setLoading(false); // Reset loading state after operation completes
        }
    };
    
    

    useEffect(() => {
        async function getFlashcard() {
          if (!search || !user) {
            console.error('Missing required parameters: user ID or search parameter');
            return
          }
      
          const colRef = collection(doc(collection(db, 'users'), user.id), search)
          const docs = await getDocs(colRef)
          const flashcards = []
          docs.forEach((doc) => {
            flashcards.push({ id: doc.id, ...doc.data() })
          })
          setFlashcards(flashcards)
        }
        getFlashcard()
      }, [search, user])


    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    const handleOpenDialog = () => {
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
    }

    const saveFlashcards = async () => {
        if (!setName.trim()) {
          alert('Please enter a name for your flashcard set.')
          return
        }
      
        try {
          const userDocRef = doc(collection(db, 'users'), user.id)
          const userDocSnap = await getDoc(userDocRef)
      
          const batch = writeBatch(db)
      
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            const updatedSets = [...(userData.flashcardSets || []), { name: setName }]
            batch.update(userDocRef, { flashcardSets: updatedSets })
          } else {
            batch.set(userDocRef, { flashcardSets: [{ name: setName }] })
          }
      
          const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName)
          batch.set(setDocRef, { flashcards })
      
          await batch.commit()
      
          alert('Flashcards saved successfully!')
          handleCloseDialog()
          setSetName('')
        } catch (error) {
          console.error('Error saving flashcards:', error)
          alert('An error occurred while saving flashcards. Please try again.')
        }
    }

    return (
        <Container maxWidth="md">
        <Box sx={{ mt: 4, mb:6, display:'flex', flexDirection: 'column', alignItems: 'center', }}>
            <Typography variant="h4" component="h1" gutterBottom>
            Generate Flashcards
            </Typography>
            <Paper sx={{ p: 4, width: '100%' }}>
                <TextField
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    label="Enter text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            disabled={loading} // Disable the button when loading
            >
            {loading ? 'Generating...' : 'Generate Flashcards'}
            </Button>

            </Paper>
        </Box>

        {flashcards.length > 0 && (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Generated Flashcards
                </Typography>
                <Grid container spacing={3}>
                    {flashcards.map((flashcard, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                <CardActionArea
                                    onClick={() => {
                                        handleCardClick(index)
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{
                                            perspective: '1000px',
                                            '& > div': {
                                                transition: 'transform 0.6s',
                                                transformStyle: 'preserve-3d',
                                                position: 'relative',
                                                width: '100%',
                                                height: '200px',
                                                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                                                transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                            },
                                            '& > div > div': {
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                backfaceVisibility: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                padding: 2,
                                                boxSizing: 'border-box',
                                            },
                                            '& > div > div:nth-of-type(2)': {
                                                transform: 'rotateY(180deg)',
                                            },
                                        }}
                                        >
                                            <div>
                                                <div>
                                                    {/* <Typography variant="h6">Front:</Typography> */}
                                                    <Typography variant="h5" component="div" >{flashcard.front}</Typography>
                                                </div>    
                                                <div>
                                                    {/* <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography> */}
                                                    <Typography variant="h5" component="div" >{flashcard.back}</Typography>
                                                </div>
                                            </div>        
                                        </Box>
                                    </CardContent>
                                </CardActionArea>
                                
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{mt: 4, display: 'flex', justifyContent: 'center'}}>
                    <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                        Save Flashcards
                    </Button>
                </Box>
            </Box>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
                <DialogContentText>
                Please enter a name for your flashcard set.
                </DialogContentText>
                <TextField
                autoFocus
                margin="dense"
                label="Set Name"
                type="text"
                fullWidth
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                variant='outlined'
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={saveFlashcards} color="primary">
                Save
                </Button>
            </DialogActions>
            </Dialog>        

        </Container>
    );
}